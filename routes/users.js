const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

// ─── GET ALL USERS (admin) ────────────────────────────────────────────────────
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
});

// ─── UPDATE USER ROLE (admin) ─────────────────────────────────────────────────
router.put("/:id/role", protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin", "librarian"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role." });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, message: "User role updated.", user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update role." });
  }
});

// ─── DEACTIVATE USER (admin) ──────────────────────────────────────────────────
router.put("/:id/deactivate", protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: "User deactivated." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to deactivate user." });
  }
});

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, institution } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, institution },
      { new: true, runValidators: true }
    ).select("-password");
    res.json({ success: true, message: "Profile updated.", user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update profile." });
  }
});

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters." });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to change password." });
  }
});

module.exports = router;
