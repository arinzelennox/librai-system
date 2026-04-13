const mongoose = require("mongoose");

const archiveSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    index: true,
  },
  type: {
    type: String,
    enum: ["Legal Document", "Institutional", "Report", "Oral History", "Photograph", "Manuscript", "Map", "Other"],
    default: "Other",
  },
  date: { type: String, trim: true },
  description: { type: String, trim: true },

  // ─── FILE ────────────────────────────────────────────────────────────────
  fileUrl: { type: String, default: "" },
  fileName: { type: String, default: "" },
  fileSize: { type: String, default: "" },
  format: { type: String, default: "PDF" },

  // ─── AI GENERATED METADATA ───────────────────────────────────────────────
  keywords: [{ type: String, lowercase: true, trim: true }],
  extractedText: { type: String, default: "" }, // OCR result
  aiSummary: { type: String, default: "" },
  aiConfidence: { type: String, default: "" },

  // ─── CLASSIFICATION ──────────────────────────────────────────────────────
  ddc: { type: String, trim: true },
  ddc_full: { type: String, trim: true },
  lc: { type: String, trim: true },
  lc_full: { type: String, trim: true },
  subject: { type: String, trim: true },

  // ─── STATUS ──────────────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  // ─── TRACKING ────────────────────────────────────────────────────────────
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  institution: { type: String, default: "LibrAI System" },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// ─── FULL TEXT SEARCH INDEX ───────────────────────────────────────────────────
archiveSchema.index({
  title: "text",
  description: "text",
  extractedText: "text",
  keywords: "text",
  subject: "text",
});

module.exports = mongoose.model("Archive", archiveSchema);
