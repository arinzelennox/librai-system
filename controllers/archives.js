const Archive = require("../models/Archive");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ─── MULTER SETUP ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || "./uploads";
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpeg|jpg|png|tiff|docx/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only PDF, images, and DOCX files are allowed."));
  },
});

exports.uploadMiddleware = upload.single("document");

// ─── GET ALL ARCHIVES ─────────────────────────────────────────────────────────
exports.getArchives = async (req, res) => {
  try {
    const { search, status, lc, ddc, type, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (status) query.status = status;
    else query.status = "approved"; // public only sees approved
    if (lc) query.lc = lc.toUpperCase();
    if (ddc) query.ddc = ddc;
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Archive.countDocuments(query);
    const archives = await Archive.find(query)
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, count: archives.length, total, archives });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch archives." });
  }
};

// ─── GET SINGLE ARCHIVE ───────────────────────────────────────────────────────
exports.getArchive = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id).populate("uploadedBy", "name");
    if (!archive) return res.status(404).json({ success: false, message: "Archive not found." });
    await Archive.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true, archive });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch archive." });
  }
};

// ─── UPLOAD ARCHIVE ───────────────────────────────────────────────────────────
exports.uploadArchive = async (req, res) => {
  try {
    const { title, type, date, description, keywords, lc, ddc, subject } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required." });

    const archiveData = {
      title,
      type: type || "Other",
      date,
      description,
      keywords: keywords ? keywords.split(",").map(k => k.trim()) : [],
      lc,
      ddc,
      subject,
      uploadedBy: req.user._id,
      status: "pending",
    };

    if (req.file) {
      archiveData.fileUrl = `/uploads/${req.file.filename}`;
      archiveData.fileName = req.file.originalname;
      archiveData.fileSize = (req.file.size / 1024 / 1024).toFixed(2) + " MB";
      archiveData.format = path.extname(req.file.originalname).slice(1).toUpperCase();
    }

    const archive = await Archive.create(archiveData);
    res.status(201).json({
      success: true,
      message: "Document uploaded successfully. Awaiting admin approval.",
      archive,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Upload failed: " + err.message });
  }
};

// ─── APPROVE ARCHIVE (admin only) ────────────────────────────────────────────
exports.approveArchive = async (req, res) => {
  try {
    const archive = await Archive.findByIdAndUpdate(
      req.params.id,
      { status: "approved", approvedBy: req.user._id },
      { new: true }
    );
    if (!archive) return res.status(404).json({ success: false, message: "Archive not found." });
    res.json({ success: true, message: "Archive approved.", archive });
  } catch (err) {
    res.status(500).json({ success: false, message: "Approval failed." });
  }
};

// ─── REJECT / DELETE ARCHIVE ──────────────────────────────────────────────────
exports.deleteArchive = async (req, res) => {
  try {
    await Archive.findByIdAndUpdate(req.params.id, { isActive: false, status: "rejected" });
    res.json({ success: true, message: "Archive removed." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to remove archive." });
  }
};

// ─── GET PENDING ARCHIVES (admin) ────────────────────────────────────────────
exports.getPendingArchives = async (req, res) => {
  try {
    const archives = await Archive.find({ status: "pending", isActive: true })
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: archives.length, archives });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch pending archives." });
  }
};
