const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── PROTECT ROUTE — must be logged in ───────────────────────────────────────
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized. Please log in." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "User not found or account deactivated." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token. Please log in again." });
  }
};

// ─── ADMIN ONLY ───────────────────────────────────────────────────────────────
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required." });
  }
  next();
};

// ─── LIBRARIAN OR ADMIN ───────────────────────────────────────────────────────
exports.librarianOrAdmin = (req, res, next) => {
  if (!["admin", "librarian"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Librarian or Admin access required." });
  }
  next();
};

// ─── EMAIL CONFIRMED ──────────────────────────────────────────────────────────
exports.emailConfirmed = (req, res, next) => {
  if (!req.user.isEmailConfirmed) {
    return res.status(403).json({ success: false, message: "Please confirm your email first." });
  }
  next();
};
