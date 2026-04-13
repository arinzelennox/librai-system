const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    index: true,
  },
  author: {
    type: String,
    required: [true, "Author is required"],
    trim: true,
    index: true,
  },
  year: {
    type: Number,
    min: [1000, "Invalid year"],
    max: [new Date().getFullYear() + 1, "Invalid year"],
  },
  subject: { type: String, trim: true, index: true },
  description: { type: String, trim: true },
  isbn: { type: String, trim: true, unique: true, sparse: true },

  // ─── CLASSIFICATION ──────────────────────────────────────────────────────
  ddc: { type: String, trim: true }, // e.g. "800"
  ddc_full: { type: String, trim: true }, // e.g. "823.914"
  lc: { type: String, trim: true }, // e.g. "P"
  lc_full: { type: String, trim: true }, // e.g. "PR9387.9.A3"

  // ─── METADATA ────────────────────────────────────────────────────────────
  tags: [{ type: String, lowercase: true, trim: true }],
  cover: { type: String, default: "📗" },
  coverImage: { type: String, default: "" },
  publisher: { type: String, trim: true },
  edition: { type: String, trim: true },
  pages: { type: Number },
  language: { type: String, default: "English" },

  // ─── AVAILABILITY ────────────────────────────────────────────────────────
  available: { type: Boolean, default: true },
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },

  // ─── ANALYTICS ───────────────────────────────────────────────────────────
  views: { type: Number, default: 0 },
  borrows: { type: Number, default: 0 },

  // ─── INSTITUTION ─────────────────────────────────────────────────────────
  institution: { type: String, default: "LibrAI System" },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// ─── FULL TEXT SEARCH INDEX ───────────────────────────────────────────────────
bookSchema.index({
  title: "text",
  author: "text",
  subject: "text",
  description: "text",
  tags: "text",
  ddc_full: "text",
  lc_full: "text",
});

module.exports = mongoose.model("Book", bookSchema);
