const express = require("express");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const { loginSchema, registerSchema } = require("../validation/schemas");
const { register, login } = require("../services/authService");

const router = express.Router();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const result = await register(req.body);
    res.status(201).json({
      success: true,
      message: "Registration successful.",
      data: result,
    });
  })
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await login(req.body.email, req.body.password);
    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result,
    });
  })
);

router.get(
  "/me",
  auth,
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  })
);

module.exports = router;
