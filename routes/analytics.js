const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const Archive = require("../models/Archive");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

// ─── DASHBOARD ANALYTICS (admin) ──────────────────────────────────────────────
router.get("/dashboard", protect, adminOnly, async (req, res) => {
  try {
    const [totalBooks, totalArchives, totalUsers, pendingArchives, topBooks] = await Promise.all([
      Book.countDocuments({ isActive: true }),
      Archive.countDocuments({ isActive: true, status: "approved" }),
      User.countDocuments({ isActive: true }),
      Archive.countDocuments({ status: "pending", isActive: true }),
      Book.find({ isActive: true }).sort({ views: -1 }).limit(5).select("title author views cover lc ddc_full"),
    ]);

    // LC class distribution
    const lcDistribution = await Book.aggregate([
      { $match: { isActive: true, lc: { $exists: true, $ne: "" } } },
      { $group: { _id: "$lc", count: { $sum: 1 }, totalViews: { $sum: "$views" } } },
      { $sort: { count: -1 } },
    ]);

    // DDC distribution
    const ddcDistribution = await Book.aggregate([
      { $match: { isActive: true, ddc: { $exists: true, $ne: "" } } },
      { $group: { _id: "$ddc", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      stats: { totalBooks, totalArchives, totalUsers, pendingArchives },
      topBooks,
      lcDistribution,
      ddcDistribution,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch analytics." });
  }
});

// ─── PUBLIC STATS ─────────────────────────────────────────────────────────────
router.get("/public", async (req, res) => {
  try {
    const [books, archives, users] = await Promise.all([
      Book.countDocuments({ isActive: true }),
      Archive.countDocuments({ isActive: true, status: "approved" }),
      User.countDocuments({ isActive: true }),
    ]);
    res.json({ success: true, stats: { books, archives, users } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch stats." });
  }
});

module.exports = router;
