const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false, // Never return password in queries
  },
  role: {
    type: String,
    enum: ["user", "admin", "librarian"],
    default: "user",
  },
  institution: {
    type: String,
    trim: true,
    default: "",
  },
  isEmailConfirmed: {
    type: Boolean,
    default: false,
  },
  emailConfirmToken: String,
  emailConfirmExpire: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  savedBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
  }],
  readingHistory: [{
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    readAt: { type: Date, default: Date.now },
  }],
  searchHistory: [{
    query: String,
    searchedAt: { type: Date, default: Date.now },
  }],
  totalReads: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  avatar: { type: String, default: "" },
}, {
  timestamps: true,
});

// ─── HASH PASSWORD BEFORE SAVE ────────────────────────────────────────────────
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── COMPARE PASSWORD ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── GENERATE EMAIL CONFIRMATION TOKEN ───────────────────────────────────────
userSchema.methods.generateEmailConfirmToken = function() {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailConfirmToken = crypto.createHash("sha256").update(token).digest("hex");
  this.emailConfirmExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// ─── GENERATE PASSWORD RESET TOKEN ───────────────────────────────────────────
userSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
  this.passwordResetExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  return token;
};

module.exports = mongoose.model("User", userSchema);
