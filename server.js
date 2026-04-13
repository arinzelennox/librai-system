const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const app = express();

// ─── SECURITY MIDDLEWARE ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
 origin: ["http://localhost:5173", "http://localhost:3000", "https://librai-system.vercel.app"],
  credentials: true,
}));

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts, please try again later." },
});
app.use("/api/", limiter);
app.use("/api/auth/", authLimiter);

// ─── BODY PARSING ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── STATIC FILES ─────────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── DATABASE CONNECTION ──────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err.message));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/books", require("./routes/books"));
app.use("/api/archives", require("./routes/archives"));
app.use("/api/users", require("./routes/users"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/ai", require("./routes/ai"));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "LibrAI API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 LibrAI Server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
