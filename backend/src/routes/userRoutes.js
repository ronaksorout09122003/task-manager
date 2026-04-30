const express = require("express");
const { getUsers, getUserById } = require("../controllers/userController");
const { authMiddleware, adminOnlyMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);
router.get("/", adminOnlyMiddleware, getUsers);
router.get("/:id", getUserById);

module.exports = router;
