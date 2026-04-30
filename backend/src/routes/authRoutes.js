const express = require("express");
const { login, changePassword, me } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { loginSchema, passwordChangeSchema } = require("../utils/validators");

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.get("/me", authMiddleware, me);
router.patch("/password", authMiddleware, validate(passwordChangeSchema), changePassword);

module.exports = router;
