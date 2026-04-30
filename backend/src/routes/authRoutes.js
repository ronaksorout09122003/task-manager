const express = require("express");
const { signup, login, me } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { signupSchema, loginSchema } = require("../utils/validators");

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.get("/me", authMiddleware, me);

module.exports = router;
