// ─── routes/auth.js ───────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const { register, login, confirmEmail, getMe, forgotPassword, resetPassword } = require("../controllers/auth");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/confirm/:token", confirmEmail);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router;
