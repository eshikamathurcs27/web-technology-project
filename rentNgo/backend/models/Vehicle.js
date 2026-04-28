const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vehicle name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["car", "bike"],
      required: [true, "Vehicle type is required"],
    },
    pricePerDay: {
      type: Number,
      required: [true, "Price per day is required"],
      min: 0,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      required: [true, "Vehicle image is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    transmission: {
      type: String,
      default: "Manual",
    },
    fuel: {
      type: String,
      default: "Petrol",
    },
    seats: {
      type: Number,
      default: 4,
    },
    bags: {
      type: Number,
      default: 2,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
