// RentNgo - Vehicle Rental System
function updateNavbar() {
    const navButtons = document.getElementById('nav-buttons');
    
    if (!navButtons) return;
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const username = localStorage.getItem('username');
    
    if (isLoggedIn === 'true' && username) {
        //  show username button
        navButtons.innerHTML = `
            <button class="user-btn" onclick="showUserMenu()">
                 ${username}
            </button>
        `;
    } else {
        // show Login/Signup button
        navButtons.innerHTML = `
            <button class="login-signup-btn" onclick="window.location.href='login.html'">
                Login / Signup
            </button>
        `;
    }
}

// Show user menu with logout option
function showUserMenu() {
    const username = localStorage.getItem('username');
    const useremail = localStorage.getItem('useremail');
    
    const confirmAction = confirm(
        `Logged in as:\n\nName: ${username}\nEmail: ${useremail}\n\nClick OK to Logout or Cancel to stay logged in.`
    );
    
    if (confirmAction) {
        logout();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    updateNavbar();
    initializeForms();
    initializeNavigation();
});

// toggle password
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input && btn) {
        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = 'Show';
            btn.style.opacity = '1';
        } else {
            input.type = 'password';
            btn.textContent = 'Hide';
            btn.style.opacity = '0.6';
        }
    }
}

// Register function - saves user data to localStorage
function register(name, email, password, phone) {
    if (!name || !email || !password || !phone) {
        alert('Please fill all fields!');
        return false;
    }

    // Check if user already exists
    const existingEmail = localStorage.getItem('useremail');
    if (existingEmail === email) {
        alert('User with this email already exists! Please login.');
        return false;
    }

    // Save user data to localStorage
    localStorage.setItem('username', name);
    localStorage.setItem('useremail', email);
    localStorage.setItem('userpassword', password);
    localStorage.setItem('userphone', phone);

    alert('Registration Successful! Please login.');
    window.location.href = 'login.html';
    return true;
}

// Login function - checks credentials from localStorage
function login(email, password) {
    const storedEmail = localStorage.getItem('useremail');
    const storedPassword = localStorage.getItem('userpassword');
    const storedName = localStorage.getItem('username');

    if (!email || !password) {
        alert('Please fill in all fields!');
        return false;
    }

    if (email === storedEmail && password === storedPassword) {
        // Login successful
        localStorage.setItem('isLoggedIn', 'true');
        alert('Login Successful! Welcome ' + storedName);
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        return true;
    } else {
        alert('Invalid Email or Password!');
        return false;
    }
}

// Logout function
function logout() {
    localStorage.clear();
    alert('Logged out successfully!');
    window.location.href = 'login.html';
}

// View car details - store car data in localStorage and redirect
function viewCarDetails(name, price, seats, transmission, fuel, rating, bags, image) {
    // Store car details in localStorage
    localStorage.setItem('selectedCar', JSON.stringify({
        name: name,
        price: price,
        seats: seats,
        transmission: transmission,
        fuel: fuel,
        rating: rating,
        bags: bags,
        image: image
    }));
    
    // Redirect to vehicle details page
    window.location.href = 'vehicle-details.html';
}

// Initialize forms
function initializeForms() {
    // LOGIN FORM
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();

            login(email, password);
        });
    }

    // REGISTER FORM
    const registerForm = document.querySelector('.register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const phone = document.getElementById('reg-phone').value.trim();
            const password = document.getElementById('reg-password').value.trim();
            const confirmPassword = document.getElementById('reg-confirm-password').value.trim();

            // Check if passwords match
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            register(name, email, password, phone);
        });
    }

    // bookingform
    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Check if logged in
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            if (isLoggedIn !== 'true') {
                alert('Please login to complete booking! ');
                window.location.href = 'login.html';
                return;
            }

            const pickupDate = document.getElementById('pickup-date');
            const pickupTime = document.getElementById('pickup-time');


            const pickupLocation = document.getElementById('pickup-location');

            if ((!pickupDate || !pickupDate.value) || 
                (!pickupTime || !pickupTime.value) || 

                (!pickupLocation || !pickupLocation.value.trim())) {
                alert('Please fill in all required fields! ');
                return;
            }

            // Store booking details
            const bookingDetails = {
                carName: 'Maruti Swift',
                carPrice: 1200,
                pickupDate: pickupDate.value,
                pickupTime: pickupTime.value,
                pickupLocation: pickupLocation.value.trim(),
                bookingId: 'RNG-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                bookingDate: new Date().toLocaleString(),
                userName: localStorage.getItem('username')
            };

            localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));

            alert('Booking Confirmed!  Redirecting.');
            setTimeout(() => {
                window.location.href = 'booking-success.html';
            }, 1000);
        });
    }
}

// navigation 
function initializeNavigation() {
    //for viewing detail
    document.querySelectorAll('.view-details-btn, .rent-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            window.location.href = 'vehicle-details.html';
        });
    });

    // book now
    document.querySelectorAll('.book-now-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            if (isLoggedIn !== 'true') {
                alert('Please login to book a car! ');
                window.location.href = 'login.html';
                return;
            }
            window.location.href = 'booking.html';
        });
    });

    // wishlist
    document.querySelectorAll('.wishlist-btn').forEach(btn => 
        {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('active');
            
            if (this.classList.contains('active')) {
                this.style.color = '#e11d48';
                alert('Added to Wishlist!');
            } else {
                alert('Removed from Wishlist');
            }
        });
    });

    // fiklter booking
    const filterBtn = document.querySelector('.filter-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', function () {
            alert('Filters Applied! ');
        });
    }

    // cancel booking
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            if (confirm('Are you sure you want to cancel this booking?')) {
                const statusBadge = this.parentElement.querySelector('.status-badge');
                if (statusBadge) {
                    statusBadge.textContent = 'Cancelled';
                    statusBadge.style.background = '#fee2e2';
                    statusBadge.style.color = '#991b1b';
                }
                this.style.display = 'none';
                alert('Booking Cancelled! ');
            }
        });
    });
}


function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.setAttribute('min', today);
    });
}

// Load car details on vehicle-details.html page
function loadCarDetails() {
    const carData = localStorage.getItem('selectedCar');
    
    if (carData) {
        const car = JSON.parse(carData);
        
        // Update page elements
        const carNameEl = document.getElementById('car-name');
        const carPriceEl = document.getElementById('car-price');
        const carRatingEl = document.getElementById('car-rating');
        const carSeatsEl = document.getElementById('car-seats');
        const carTransmissionEl = document.getElementById('car-transmission');
        const carFuelEl = document.getElementById('car-fuel');
        const carBagsEl = document.getElementById('car-bags');
        const carDescriptionEl = document.getElementById('car-description');
        const mainImageEl = document.getElementById('main-car-image');
        
        if (carNameEl) carNameEl.textContent = car.name;
        if (carPriceEl) carPriceEl.textContent = '₹' + car.price;
        if (carRatingEl) {
            const stars = '★'.repeat(Math.floor(car.rating));
            carRatingEl.textContent = `${stars} (${car.rating}/5)`;
        }
        if (carSeatsEl) carSeatsEl.textContent = car.seats + ' Seats';
        if (carTransmissionEl) carTransmissionEl.textContent = car.transmission;
        if (carFuelEl) carFuelEl.textContent = car.fuel;
        if (carBagsEl) carBagsEl.textContent = car.bags + ' Bags';
        if (mainImageEl) mainImageEl.src = car.image;
        
        // Update description based on car type
        if (carDescriptionEl) {
            const descriptions = {
                'Maruti Swift': 'The Maruti Swift is a perfect hatchback for city driving. It offers great mileage, comfortable seating, and easy handling making it ideal for both daily commutes and weekend getaways.',
                'Hyundai Creta': 'The Hyundai Creta is a stylish and feature-packed SUV. With its powerful engine and spacious interior, it delivers a comfortable ride for long journeys and city drives alike.',
                'Tata Altroz': 'The Tata Altroz is a premium hatchback with a bold design and refined performance. It combines modern features with excellent build quality for a superior driving experience.',
                'Mahindra Thar': 'The Mahindra Thar is a rugged off-road SUV built for adventure. Its powerful 4x4 capability and bold design make it perfect for tackling tough terrains.',
                'Honda City': 'The Honda City is a premium sedan known for its refined engine and luxurious interior. It offers a smooth ride and advanced features for a comfortable driving experience.',
                'Toyota Fortuner': 'The Toyota Fortuner is a premium SUV with commanding presence and powerful performance. It offers luxury, comfort, and off-road capability in one impressive package.'
            };
            carDescriptionEl.textContent = descriptions[car.name] || descriptions['Maruti Swift'];
        }
        
        // Update title
        document.title = car.name + ' - RentNgo';
    }
}

// Change main image on thumbnail click
function changeImage(thumbnail) {
    const mainImage = document.getElementById('main-car-image');
    if (mainImage && thumbnail) {
        mainImage.src = thumbnail.src.replace('w=200&h=150', 'w=800&h=500');
        
        // Remove active class from all thumbnails
        document.querySelectorAll('.thumbnail-images img').forEach(img => {
            img.classList.remove('active');
        });
        
        // Add active class to clicked thumbnail
        thumbnail.classList.add('active');
    }
}

// Call loadCarDetails when page loads
if (window.location.pathname.includes('vehicle-details.html')) {
    document.addEventListener('DOMContentLoaded', loadCarDetails);
}

// Calling
setMinDate();


console.log('%cRentNgo - Vehicle Rental System', 'color: #2563eb; font-size: 16px; font-weight: bold;');
console.log('%cBuilt with  using HTML, CSS & JavaScript', 'color: #64748b; font-size: 14px;');