const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendConfirmationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require("../utils/email");

// ─── GENERATE JWT TOKEN ───────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, institution } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }

    const user = await User.create({ name, email, password, institution });

    // Generate confirmation token
    const confirmToken = user.generateEmailConfirmToken();
    await user.save({ validateBeforeSave: false });

    // Send confirmation email
    const confirmUrl = `${process.env.FRONTEND_URL}/confirm-email/${confirmToken}`;
    try {
      await sendConfirmationEmail(user, confirmUrl);
    } catch (emailErr) {
      console.error("Email send failed:", emailErr.message);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: "Account created! Please check your email to confirm your account.",
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};

// ─── CONFIRM EMAIL ────────────────────────────────────────────────────────────
exports.confirmEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      emailConfirmToken: hashedToken,
      emailConfirmExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired confirmation link." });
    }

    user.isEmailConfirmed = true;
    user.emailConfirmToken = undefined;
    user.emailConfirmExpire = undefined;
    await user.save();

    // Send welcome email
    try { await sendWelcomeEmail(user); } catch (e) {}

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: "Email confirmed! Your account is now active.",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Confirmation failed. Please try again." });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (!user.isEmailConfirmed) {
      return res.status(403).json({ success: false, message: "Please confirm your email before logging in." });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Your account has been deactivated." });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution,
        totalReads: user.totalReads,
        savedBooks: user.savedBooks,
        joined: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedBooks", "title author cover ddc_full lc_full");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to get user data." });
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() });
    if (!user) {
      // Return success even if user not found (security)
      return res.json({ success: true, message: "If that email exists, a reset link has been sent." });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    try {
      await sendPasswordResetEmail(user, resetUrl);
    } catch (e) {
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: "Email could not be sent." });
    }

    res.json({ success: true, message: "Password reset link sent to your email." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to process request." });
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset link." });
    }

    if (!req.body.password || req.body.password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, message: "Password reset successful.", token });
  } catch (err) {
    res.status(500).json({ success: false, message: "Password reset failed." });
  }
};
