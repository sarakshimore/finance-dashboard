const express = require("express");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { ACTIONS } = require("../constants/actions");
const { createUserSchema, updateUserSchema } = require("../validation/schemas");
const { createUser, listUsers, getUserById, updateUser } = require("../services/userService");

const router = express.Router();

router.use(auth);
router.use(authorize(ACTIONS.MANAGE_USERS));

router.post(
  "/",
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    const user = await createUser(req.body);
    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: user,
    });
  })
);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await listUsers();
    res.status(200).json({
      success: true,
      data: users,
    });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  })
);

router.patch(
  "/:id",
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const updatedUser = await updateUser(req.params.id, req.body, req.user.id);
    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: updatedUser,
    });
  })
);

module.exports = router;
