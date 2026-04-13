const express = require("express");
const router = express.Router();
const { getArchives, getArchive, uploadArchive, approveArchive, deleteArchive, getPendingArchives, uploadMiddleware } = require("../controllers/archives");
const { protect, adminOnly, librarianOrAdmin } = require("../middleware/auth");

router.get("/", getArchives);
router.get("/pending", protect, librarianOrAdmin, getPendingArchives);
router.get("/:id", getArchive);
router.post("/", protect, uploadMiddleware, uploadArchive);
router.put("/:id/approve", protect, librarianOrAdmin, approveArchive);
router.delete("/:id", protect, adminOnly, deleteArchive);

module.exports = router;
