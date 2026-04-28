const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const createBooking = async (req, res, next) => {
  try {
    const { vehicleId, startDate, endDate } = req.body;

    if (!vehicleId || !startDate || !endDate) {
      res.status(400);
      throw new Error("Vehicle, start date, and end date are required.");
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      res.status(404);
      throw new Error("Vehicle not found.");
    }

    if (!vehicle.availability) {
      res.status(400);
      throw new Error("This vehicle is currently unavailable.");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      res.status(400);
      throw new Error("Invalid booking dates.");
    }

    if (end <= start) {
      res.status(400);
      throw new Error("End date must be after start date.");
    }

    const overlappingBooking = await Booking.findOne({
      vehicleId,
      status: { $in: ["confirmed", "completed"] },
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (overlappingBooking) {
      res.status(409);
      throw new Error("Vehicle is already booked for the selected dates.");
    }

    const rentalDays = Math.ceil((end - start) / MS_PER_DAY);
    const totalPrice = rentalDays * vehicle.pricePerDay;

    const booking = await Booking.create({
      userId: req.user._id,
      vehicleId,
      startDate: start,
      endDate: end,
      totalPrice,
      status: "confirmed",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("userId", "name email role")
      .populate("vehicleId");

    res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("vehicleId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email role")
      .populate("vehicleId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("vehicleId");

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found.");
    }

    const isOwner = booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error("You are not allowed to cancel this booking.");
    }

    if (booking.status === "cancelled") {
      res.status(400);
      throw new Error("Booking is already cancelled.");
    }

    booking.status = "cancelled";
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("userId", "name email role")
      .populate("vehicleId");

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getAdminBookings,
  cancelBooking,
};
