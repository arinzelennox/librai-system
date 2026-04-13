const express = require("express");
const router = express.Router();
const { getBooks, getBook, createBook, updateBook, deleteBook, toggleSave, getRecommendations, seedBooks } = require("../controllers/books");
const { protect, adminOnly, librarianOrAdmin } = require("../middleware/auth");

router.get("/", getBooks);
router.get("/recommendations", protect, getRecommendations);
router.get("/:id", getBook);
router.post("/", protect, librarianOrAdmin, createBook);
router.put("/:id", protect, librarianOrAdmin, updateBook);
router.delete("/:id", protect, adminOnly, deleteBook);
router.post("/:id/save", protect, toggleSave);
router.post("/seed/all", protect, adminOnly, seedBooks);

module.exports = router;
