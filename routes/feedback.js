const express = require("express");
const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");

const router = express.Router();

// POST /api/feedback — submit feedback
router.post("/", async (req, res) => {
  try {
    const { studentName, courseName, message, rating } = req.body;
    if (!studentName?.trim() || !courseName?.trim() || !message?.trim() || rating === undefined) {
      return res.status(400).json({ message: "studentName, courseName, message and rating are required." });
    }
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "rating must be an integer between 1 and 5." });
    }

    const feedback = await Feedback.create({ studentName, courseName, message, rating: numericRating });
    return res.status(201).json({ message: "Feedback submitted successfully.", feedback });
  } catch (error) {
    return res.status(500).json({ message: "Could not submit feedback." });
  }
});

// GET /api/feedback?page=1&limit=10 — paginated feedback
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const [feedback, totalRecords] = await Promise.all([
      Feedback.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Feedback.countDocuments()
    ]);
    return res.status(200).json({
      feedback,
      pagination: {
        currentPage: page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not retrieve feedback." });
  }
});

// PATCH /api/feedback/:id — update review status
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid feedback ID." });
    }
    if (!["Pending", "Reviewed"].includes(status)) {
      return res.status(400).json({ message: "status must be Pending or Reviewed." });
    }
    const feedback = await Feedback.findByIdAndUpdate(
      id, { status }, { new: true, runValidators: true }
    );
    if (!feedback) return res.status(404).json({ message: "Feedback record not found." });
    return res.status(200).json({ message: "Feedback status updated.", feedback });
  } catch (error) {
    return res.status(500).json({ message: "Could not update feedback status." });
  }
});

module.exports = router;
