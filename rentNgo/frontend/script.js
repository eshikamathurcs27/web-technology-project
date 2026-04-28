const API_BASE_URL =
  window.location.protocol.startsWith("http") && window.location.origin !== "null"
    ? `${window.location.origin}/api`
    : "http://localhost:5000/api";

const AUTH_TOKEN_KEY = "rentngoToken";
const AUTH_USER_KEY = "rentngoUser";
const RECENT_BOOKING_KEY = "rentngoRecentBooking";
const FALLBACK_VEHICLE_KEY = "rentngoFallbackVehicle";

let cachedVehicles = [];

async function loadSharedPartials() {
  const includeTargets = document.querySelectorAll("[data-include]");

  await Promise.all(
    Array.from(includeTargets).map(async (target) => {
      const partialPath = target.getAttribute("data-include");
      if (!partialPath) {
        return;
      }

      try {
        const response = await fetch(partialPath);
        if (!response.ok) {
          throw new Error(`Unable to load ${partialPath}`);
        }

        const html = await response.text();
        target.outerHTML = html;
      } catch (error) {
        console.error(error.message);
      }
    })
  );

  setActiveNavLink();
}

function setActiveNavLink() {
  const currentPage = document.body.dataset.page;
  if (!currentPage) {
    return;
  }

  document.querySelectorAll("[data-page-link]").forEach((link) => {
    if (link.dataset.pageLink === currentPage) {
      link.classList.add("active");
    }
  });
}

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getStoredUser() {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

function setAuthSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

async function apiRequest(endpoint, options = {}) {
  const config = {
    method: options.method || "GET",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  };

  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const rawText = await response.text();
  let data = {};

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch (error) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || rawText || `Request failed with status ${response.status}.`);
  }

  return data;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));
}

function formatTime(dateValue) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

function calculateRentalDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return 0;
  }

  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function getRatingStars(rating) {
  const filledStars = Math.max(1, Math.min(5, Math.round(Number(rating) || 4)));
  return "&#9733;".repeat(filledStars);
}

function showEmptyState(container, message) {
  if (!container) {
    return;
  }

  container.innerHTML = `<div class="empty-state">${message}</div>`;
}

function updateNavbar() {
  const navButtons = document.getElementById("nav-buttons");
  if (!navButtons) {
    return;
  }

  const user = getStoredUser();
  if (user && getToken()) {
    navButtons.innerHTML = `
      <div class="user-stack">
        <a class="nav-secondary-btn" href="my-bookings.html">My Bookings</a>
        <button class="user-btn" type="button" onclick="showUserMenu()">
          ${user.name}${user.role === "admin" ? " (Admin)" : ""}
        </button>
      </div>
    `;
    return;
  }

  navButtons.innerHTML = `
    <button class="login-signup-btn" type="button" onclick="window.location.href='login.html'">
      Login / Signup
    </button>
  `;
}

function showUserMenu() {
  const user = getStoredUser();
  if (!user) {
    return;
  }

  const shouldLogout = confirm(
    `Logged in as ${user.name}\n${user.email}\nRole: ${user.role}\n\nPress OK to logout.`
  );

  if (shouldLogout) {
    logout();
  }
}

function logout() {
  clearAuthSession();
  localStorage.removeItem(RECENT_BOOKING_KEY);
  alert("Logged out successfully.");
  window.location.href = "login.html";
}

function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  if (!input || !button) {
    return;
  }

  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";
  button.textContent = isPassword ? "Hide" : "Show";
}

function handleGoogleAuth() {
  alert(
    "Google sign-in UI is now ready, but real login needs Google OAuth setup in the backend.\n\nNext step: create a Google Client ID and connect it to an auth route."
  );
}

function createVehicleCard(vehicle) {
  return `
    <article class="vehicle-card">
      <div class="vehicle-image">
        <img src="${vehicle.image}" alt="${vehicle.name}">
        <button class="wishlist-btn" type="button" onclick="toggleWishlist(this)" title="Add to wishlist">
          &#10084;
        </button>
      </div>
      <div class="vehicle-info">
        <h3>${vehicle.name}</h3>
        <div class="price">
          <span class="amount">${formatCurrency(vehicle.pricePerDay)}</span>
          <span class="period">/ day</span>
        </div>
        <div class="features">
          <span class="feature">${vehicle.seats} Seats</span>
          <span class="feature">${vehicle.transmission}</span>
          <span class="feature">${vehicle.fuel}</span>
        </div>
        <div class="rating">
          ${getRatingStars(vehicle.rating)}
          <span class="rating-count">(${vehicle.rating || 4.5})</span>
        </div>
        <button class="view-details-btn" type="button" onclick="openVehicleDetails('${vehicle._id}')">
          View Details
        </button>
      </div>
    </article>
  `;
}

async function fetchVehicles() {
  const response = await apiRequest("/vehicles");
  cachedVehicles = response.data || [];
  return cachedVehicles;
}

async function loadFeaturedVehicles() {
  const grid = document.querySelector(".featured-vehicles .vehicles-grid");
  if (!grid) {
    return;
  }

  try {
    const vehicles = cachedVehicles.length ? cachedVehicles : await fetchVehicles();
    grid.innerHTML = vehicles.slice(0, 3).map(createVehicleCard).join("");
  } catch (error) {
    showEmptyState(grid, "Unable to load featured vehicles right now.");
  }
}

function getVehicleFilters() {
  return {
    type: document.getElementById("vehicle-type-filter")?.value || "all",
    price: document.getElementById("price-range-filter")?.value || "all",
    trip: document.getElementById("trip-style-filter")?.value || "all",
  };
}

function matchesPriceFilter(vehicle, priceFilter) {
  const price = Number(vehicle.pricePerDay) || 0;

  if (priceFilter === "budget") {
    return price < 1500;
  }

  if (priceFilter === "mid") {
    return price >= 1500 && price <= 2500;
  }

  if (priceFilter === "premium") {
    return price > 2500;
  }

  return true;
}

function matchesTripFilter(vehicle, tripFilter) {
  const seats = Number(vehicle.seats) || 0;

  if (tripFilter === "city") {
    return seats <= 5 && Number(vehicle.pricePerDay) <= 1800;
  }

  if (tripFilter === "family") {
    return seats >= 5;
  }

  if (tripFilter === "adventure") {
    return /thar|fortuner/i.test(vehicle.name);
  }

  return true;
}

function renderVehiclesList(vehicles) {
  const grid = document.querySelector(".all-vehicles .vehicles-grid");
  const resultCount = document.getElementById("filter-results");
  if (!grid) {
    return;
  }

  if (!vehicles.length) {
    showEmptyState(grid, "No vehicles matched your filters. Try another combination.");
  } else {
    grid.innerHTML = vehicles.map(createVehicleCard).join("");
  }

  if (resultCount) {
    resultCount.textContent = `${vehicles.length} vehicle${vehicles.length === 1 ? "" : "s"} available`;
  }
}

async function loadVehiclesPage() {
  const grid = document.querySelector(".all-vehicles .vehicles-grid");
  if (!grid) {
    return;
  }

  try {
    const vehicles = cachedVehicles.length ? cachedVehicles : await fetchVehicles();
    const filters = getVehicleFilters();

    const filteredVehicles = vehicles.filter((vehicle) => {
      const typeMatch = filters.type === "all" || vehicle.type === filters.type;
      return typeMatch && matchesPriceFilter(vehicle, filters.price) && matchesTripFilter(vehicle, filters.trip);
    });

    renderVehiclesList(filteredVehicles);
  } catch (error) {
    showEmptyState(grid, "Unable to load vehicles right now.");
  }
}

function openVehicleDetails(vehicleId) {
  window.location.href = `vehicle-details.html?id=${vehicleId}`;
}

function viewCarDetails(name, price, seats, transmission, fuel, rating, bags, image) {
  localStorage.setItem(
    FALLBACK_VEHICLE_KEY,
    JSON.stringify({ name, price, seats, transmission, fuel, rating, bags, image })
  );
  window.location.href = "vehicle-details.html";
}

function renderVehicleDetail(vehicle) {
  document.getElementById("car-name").textContent = vehicle.name;
  document.getElementById("car-price").textContent = formatCurrency(vehicle.pricePerDay);
  document.getElementById("car-rating").innerHTML = `${getRatingStars(vehicle.rating)} (${vehicle.rating || 4.5}/5)`;
  document.getElementById("car-seats").textContent = `${vehicle.seats} Seats`;
  document.getElementById("car-transmission").textContent = vehicle.transmission;
  document.getElementById("car-fuel").textContent = vehicle.fuel;
  document.getElementById("car-bags").textContent = `${vehicle.bags} Bags`;
  document.getElementById("car-description").textContent =
    vehicle.description || "No description available for this vehicle yet.";
  document.getElementById("main-car-image").src = vehicle.image;
  document.getElementById("main-car-image").alt = vehicle.name;
  document.title = `${vehicle.name} - RentNgo`;

  document.querySelectorAll(".thumbnail-images img").forEach((thumbnail, index) => {
    thumbnail.src =
      index === 0
        ? vehicle.image.replace("w=800&h=500", "w=200&h=150")
        : vehicle.image.replace("w=800&h=500", `w=200&h=150&sig=${index + 1}`);
    thumbnail.alt = `${vehicle.name} view ${index + 1}`;
  });

  const bookNowBtn = document.querySelector(".book-now-btn");
  if (bookNowBtn) {
    bookNowBtn.onclick = () => {
      window.location.href = `booking.html?vehicleId=${vehicle._id}`;
    };
  }
}

function loadFallbackVehicleDetails() {
  const rawVehicle = localStorage.getItem(FALLBACK_VEHICLE_KEY);
  if (!rawVehicle) {
    return false;
  }

  const vehicle = JSON.parse(rawVehicle);
  document.getElementById("car-name").textContent = vehicle.name;
  document.getElementById("car-price").textContent = formatCurrency(vehicle.price);
  document.getElementById("car-rating").innerHTML = `${getRatingStars(vehicle.rating)} (${vehicle.rating}/5)`;
  document.getElementById("car-seats").textContent = `${vehicle.seats} Seats`;
  document.getElementById("car-transmission").textContent = vehicle.transmission;
  document.getElementById("car-fuel").textContent = vehicle.fuel;
  document.getElementById("car-bags").textContent = `${vehicle.bags} Bags`;
  document.getElementById("car-description").textContent =
    "This vehicle is available for smooth city rides and comfortable road trips.";
  document.getElementById("main-car-image").src = vehicle.image;

  const bookNowBtn = document.querySelector(".book-now-btn");
  if (bookNowBtn) {
    bookNowBtn.onclick = () => {
      window.location.href = "vehicles.html";
    };
  }

  return true;
}

async function loadVehicleDetails() {
  const detailPage = document.getElementById("car-name");
  if (!detailPage) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const vehicleId = params.get("id");

  if (!vehicleId) {
    const hasFallback = loadFallbackVehicleDetails();
    if (!hasFallback) {
      alert("Please choose a vehicle first.");
      window.location.href = "vehicles.html";
    }
    return;
  }

  try {
    const vehicleResponse = await apiRequest(`/vehicles/${vehicleId}`);
    const vehicle = vehicleResponse.data;

    renderVehicleDetail(vehicle);
    await loadSimilarVehicles(vehicleId);
  } catch (error) {
    alert(error.message);
    window.location.href = "vehicles.html";
  }
}

async function loadSimilarVehicles(currentVehicleId) {
  const grid = document.getElementById("similar-vehicles-grid");
  if (!grid) {
    return;
  }

  try {
    const vehicles = cachedVehicles.length ? cachedVehicles : await fetchVehicles();
    const similarVehicles = vehicles.filter((vehicle) => vehicle._id !== currentVehicleId).slice(0, 3);
    grid.innerHTML = similarVehicles.map(createVehicleCard).join("");
  } catch (error) {
    showEmptyState(grid, "Unable to load similar vehicles right now.");
  }
}

function updateBookingPricePreview(vehicle) {
  const pickupDate = document.getElementById("pickup-date")?.value;
  const pickupTime = document.getElementById("pickup-time")?.value || "09:00";
  const dropoffDate = document.getElementById("dropoff-date")?.value;
  const dropoffTime = document.getElementById("dropoff-time")?.value || "09:00";

  const days = calculateRentalDays(`${pickupDate}T${pickupTime}:00`, `${dropoffDate}T${dropoffTime}:00`);
  const effectiveDays = days || 1;
  const basePrice = vehicle.pricePerDay * effectiveDays;

  const summaryRows = document.querySelectorAll(".price-summary .price-row");
  if (summaryRows.length < 4) {
    return;
  }

  const baseRowSpans = summaryRows[0].querySelectorAll("span");
  const insuranceRowSpans = summaryRows[1].querySelectorAll("span");
  const taxesRowSpans = summaryRows[2].querySelectorAll("span");
  const totalRowSpans = summaryRows[3].querySelectorAll("span");

  baseRowSpans[0].textContent = `${formatCurrency(vehicle.pricePerDay)} x ${effectiveDays} day${
    effectiveDays === 1 ? "" : "s"
  }`;
  baseRowSpans[1].textContent = formatCurrency(basePrice);
  insuranceRowSpans[1].textContent = formatCurrency(0);
  taxesRowSpans[1].textContent = formatCurrency(0);
  totalRowSpans[1].textContent = formatCurrency(basePrice);
}

async function loadBookingPage() {
  const bookingForm = document.querySelector(".booking-form");
  if (!bookingForm || !document.getElementById("booking-vehicle-name")) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const vehicleId = params.get("vehicleId");

  if (!vehicleId) {
    alert("Please select a vehicle before continuing to booking.");
    window.location.href = "vehicles.html";
    return;
  }

  try {
    const response = await apiRequest(`/vehicles/${vehicleId}`);
    const vehicle = response.data;
    const vehicleImage = document.getElementById("booking-vehicle-image");
    const vehicleName = document.getElementById("booking-vehicle-name");

    if (vehicleImage) {
      vehicleImage.src = vehicle.image;
      vehicleImage.alt = vehicle.name;
    }

    if (vehicleName) {
      vehicleName.textContent = vehicle.name;
    }

    updateBookingPricePreview(vehicle);

    ["pickup-date", "pickup-time", "dropoff-date", "dropoff-time"].forEach((fieldId) => {
      const input = document.getElementById(fieldId);
      if (input) {
        input.addEventListener("change", () => updateBookingPricePreview(vehicle));
      }
    });

    bookingForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!getToken()) {
        alert("Please login to complete your booking.");
        window.location.href = "login.html";
        return;
      }

      const pickupDate = document.getElementById("pickup-date").value;
      const pickupTime = document.getElementById("pickup-time").value;
      const dropoffDate = document.getElementById("dropoff-date").value;
      const dropoffTime = document.getElementById("dropoff-time").value;
      const pickupLocation = document.getElementById("pickup-location").value.trim();
      const dropoffLocation = document.getElementById("dropoff-location").value.trim();

      if (!pickupDate || !pickupTime || !dropoffDate || !dropoffTime) {
        alert("Please fill in all booking dates and times.");
        return;
      }

      if (!pickupLocation || !dropoffLocation) {
        alert("Please add pickup and drop-off locations.");
        return;
      }

      const startDate = `${pickupDate}T${pickupTime}:00`;
      const endDate = `${dropoffDate}T${dropoffTime}:00`;

      if (!calculateRentalDays(startDate, endDate)) {
        alert("Drop-off must be after pickup.");
        return;
      }

      try {
        const bookingResponse = await apiRequest("/bookings", {
          method: "POST",
          body: {
            vehicleId,
            startDate,
            endDate,
          },
        });

        localStorage.setItem(
          RECENT_BOOKING_KEY,
          JSON.stringify({
            ...bookingResponse.data,
            pickupLocation,
            dropoffLocation,
          })
        );
        alert("Booking confirmed successfully.");
        window.location.href = "booking-success.html";
      } catch (error) {
        alert(error.message);
      }
    });
  } catch (error) {
    alert(error.message);
    window.location.href = "vehicles.html";
  }
}

function renderBookingSuccess() {
  const bookingIdEl = document.getElementById("success-booking-id");
  if (!bookingIdEl) {
    return;
  }

  const rawBooking = localStorage.getItem(RECENT_BOOKING_KEY);
  if (!rawBooking) {
    alert("No recent booking found.");
    window.location.href = "vehicles.html";
    return;
  }

  const booking = JSON.parse(rawBooking);
  const vehicleNameEl = document.getElementById("success-vehicle-name");
  const startDateEl = document.getElementById("success-start-date");
  const startTimeEl = document.getElementById("success-start-time");
  const totalPriceEl = document.getElementById("success-total-price");

  bookingIdEl.textContent = `Booking ID: ${booking._id}`;

  if (vehicleNameEl) {
    vehicleNameEl.textContent = booking.vehicleId?.name || "Vehicle";
  }

  if (startDateEl) {
    startDateEl.textContent = formatDate(booking.startDate);
  }

  if (startTimeEl) {
    startTimeEl.textContent = formatTime(booking.startDate);
  }

  if (totalPriceEl) {
    totalPriceEl.textContent = formatCurrency(booking.totalPrice);
  }
}

function getStatusLabel(status) {
  if (status === "cancelled") {
    return "Cancelled";
  }

  if (status === "completed") {
    return "Completed";
  }

  return "Upcoming";
}

function getStatusClass(status) {
  if (status === "cancelled") {
    return "cancelled";
  }

  if (status === "completed") {
    return "completed";
  }

  return "upcoming";
}

function createBookingCard(booking) {
  const vehicle = booking.vehicleId || {};
  const canCancel = booking.status === "confirmed";

  return `
    <article class="booking-card">
      <img src="${vehicle.image || ""}" alt="${vehicle.name || "Vehicle"}">
      <div class="booking-info">
        <h3>${vehicle.name || "Vehicle"}</h3>
        <div class="booking-details">
          <div class="detail-item">
            <span class="detail-icon">DATE</span>
            <span>${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">TYPE</span>
            <span>${vehicle.type || "car"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">TIME</span>
            <span>${formatTime(booking.startDate)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">PRICE</span>
            <span>${formatCurrency(booking.totalPrice)}</span>
          </div>
        </div>
      </div>
      <div class="booking-status">
        <span class="status-badge ${getStatusClass(booking.status)}">${getStatusLabel(booking.status)}</span>
        ${canCancel ? `<button class="cancel-btn" type="button" onclick="cancelBookingById('${booking._id}')">Cancel Booking</button>` : ""}
      </div>
    </article>
  `;
}

async function loadUserBookings() {
  const bookingsList = document.getElementById("bookings-list");
  if (!bookingsList) {
    return;
  }

  if (!getToken()) {
    showEmptyState(bookingsList, "Please login to view your bookings.");
    return;
  }

  try {
    const response = await apiRequest("/bookings/user");
    const bookings = response.data || [];

    if (!bookings.length) {
      showEmptyState(bookingsList, "You have not booked a vehicle yet.");
      return;
    }

    bookingsList.innerHTML = bookings.map(createBookingCard).join("");
  } catch (error) {
    showEmptyState(bookingsList, error.message);
  }
}

async function cancelBookingById(bookingId) {
  const shouldCancel = confirm("Are you sure you want to cancel this booking?");
  if (!shouldCancel) {
    return;
  }

  try {
    await apiRequest(`/bookings/${bookingId}/cancel`, {
      method: "PUT",
    });
    alert("Booking cancelled successfully.");
    await loadUserBookings();
  } catch (error) {
    alert(error.message);
  }
}

function cancelBooking() {}

function toggleWishlist(button) {
  if (!button) {
    return;
  }

  button.classList.toggle("active");
  button.style.color = button.classList.contains("active") ? "#e11d48" : "";
}

function changeImage(thumbnail) {
  const mainImage = document.getElementById("main-car-image");
  if (!mainImage || !thumbnail) {
    return;
  }

  mainImage.src = thumbnail.src.replace("w=200&h=150", "w=800&h=500");
  document.querySelectorAll(".thumbnail-images img").forEach((img) => img.classList.remove("active"));
  thumbnail.classList.add("active");
}

function setMinDate() {
  const today = new Date().toISOString().split("T")[0];
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    input.setAttribute("min", today);
  });
}

function initializeForms() {
  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value.trim();

      if (!email || !password) {
        alert("Please enter your email and password.");
        return;
      }

      try {
        const response = await apiRequest("/auth/login", {
          method: "POST",
          body: { email, password },
        });

        setAuthSession(response.data.token, response.data.user);
        alert(`Welcome back, ${response.data.user.name}.`);
        window.location.href = "index.html";
      } catch (error) {
        alert(error.message);
      }
    });
  }

  const registerForm = document.querySelector(".register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.getElementById("reg-name").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value.trim();
      const confirmPassword = document.getElementById("reg-confirm-password").value.trim();

      if (!name || !email || !password || !confirmPassword) {
        alert("Please fill in all required registration fields.");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      try {
        const response = await apiRequest("/auth/register", {
          method: "POST",
          body: { name, email, password },
        });

        setAuthSession(response.data.token, response.data.user);
        alert("Registration successful.");
        window.location.href = "index.html";
      } catch (error) {
        alert(error.message);
      }
    });
  }

  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.getElementById("contact-name").value.trim();
      const email = document.getElementById("contact-email").value.trim();
      const phone = document.getElementById("contact-phone").value.trim();
      const subject = document.getElementById("contact-subject").value.trim();
      const message = document.getElementById("contact-message").value.trim();

      try {
        await apiRequest("/contact", {
          method: "POST",
          body: { name, email, phone, subject, message },
        });

        alert("Your message has been sent successfully.");
        contactForm.reset();
      } catch (error) {
        alert(error.message);
      }
    });
  }
}

function initializeNavigation() {
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", loadVehiclesPage);
  });

  ["vehicle-type-filter", "price-range-filter", "trip-style-filter"].forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener("change", loadVehiclesPage);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadSharedPartials();
  updateNavbar();
  initializeForms();
  initializeNavigation();
  setMinDate();
  await loadFeaturedVehicles();
  await loadVehiclesPage();
  await loadVehicleDetails();
  await loadBookingPage();
  renderBookingSuccess();
  await loadUserBookings();
});

console.log("%cRentNgo - Full Stack Vehicle Rental System", "color: #2563eb; font-size: 16px; font-weight: bold;");
