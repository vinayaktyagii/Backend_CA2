require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const feedbackRoutes = require("./routes/feedback");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.get("/", (_req, res) => {
  res.json({ message: "Student Feedback Management API is running." });
});


app.use("/api/feedback", feedbackRoutes);

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`API running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();