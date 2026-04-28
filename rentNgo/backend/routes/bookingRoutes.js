const express = require("express");
const {
  createBooking,
  getUserBookings,
  getAdminBookings,
  cancelBooking,
} = require("../controllers/bookingController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/user", protect, getUserBookings);
router.get("/admin", protect, adminOnly, getAdminBookings);
router.put("/:id/cancel", protect, cancelBooking);

module.exports = router;
