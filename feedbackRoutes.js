const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

// POST
router.post("/", async (req, res) => {
  try {
    const { studentName, courseName, message, rating } = req.body;

    const feedback = new Feedback({
      studentName,
      courseName,
      message,
      rating,
    });

    await feedback.save();

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET with Pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const feedbacks = await Feedback.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Feedback.countDocuments();

    res.json({
      page,
      total,
      feedbacks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH
router.patch("/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        message: "Feedback not found",
      });
    }

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;