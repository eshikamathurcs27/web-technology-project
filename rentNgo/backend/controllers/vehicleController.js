const Vehicle = require("../models/Vehicle");

const defaultVehicles = [
  {
    name: "Maruti Swift",
    type: "car",
    pricePerDay: 1200,
    availability: true,
    image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=500&fit=crop",
    description:
      "The Maruti Swift is a practical hatchback for daily city travel and short trips.",
    transmission: "Manual",
    fuel: "Petrol",
    seats: 4,
    bags: 2,
    rating: 4.8,
  },
  {
    name: "Hyundai Creta",
    type: "car",
    pricePerDay: 1800,
    availability: true,
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&h=500&fit=crop",
    description:
      "The Hyundai Creta offers a roomy cabin, smooth automatic drive, and modern styling.",
    transmission: "Auto",
    fuel: "Diesel",
    seats: 5,
    bags: 3,
    rating: 4.6,
  },
  {
    name: "Tata Altroz",
    type: "car",
    pricePerDay: 1230,
    availability: true,
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=500&fit=crop",
    description:
      "The Tata Altroz combines solid safety, hatchback convenience, and comfortable seating.",
    transmission: "Manual",
    fuel: "Petrol",
    seats: 5,
    bags: 2,
    rating: 4.2,
  },
  {
    name: "Mahindra Thar",
    type: "car",
    pricePerDay: 2500,
    availability: true,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=500&fit=crop",
    description:
      "The Mahindra Thar is ideal for road trips and adventure drives with rugged capability.",
    transmission: "Manual",
    fuel: "Diesel",
    seats: 4,
    bags: 2,
    rating: 4.5,
  },
  {
    name: "Honda City",
    type: "car",
    pricePerDay: 2200,
    availability: true,
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=500&fit=crop",
    description:
      "The Honda City is a refined sedan for comfortable family trips and premium daily driving.",
    transmission: "Auto",
    fuel: "Petrol",
    seats: 5,
    bags: 3,
    rating: 4.9,
  },
  {
    name: "Toyota Fortuner",
    type: "car",
    pricePerDay: 3500,
    availability: true,
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&h=500&fit=crop",
    description:
      "The Toyota Fortuner delivers strong road presence, space, and long-distance comfort.",
    transmission: "Auto",
    fuel: "Diesel",
    seats: 7,
    bags: 4,
    rating: 4.9,
  },
];

const ensureDefaultVehicles = async () => {
  const count = await Vehicle.countDocuments();
  if (!count) {
    await Vehicle.insertMany(defaultVehicles);
  }
};

const getVehicles = async (req, res, next) => {
  try {
    await ensureDefaultVehicles();

    const filter = {};
    if (req.query.type) {
      filter.type = req.query.type;
    }

    if (req.query.available === "true") {
      filter.availability = true;
    }

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      res.status(404);
      throw new Error("Vehicle not found.");
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully.",
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!vehicle) {
      res.status(404);
      throw new Error("Vehicle not found.");
    }

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully.",
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      res.status(404);
      throw new Error("Vehicle not found.");
    }

    await vehicle.deleteOne();

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
