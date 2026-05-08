const express = require("express");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { ACTIONS } = require("../constants/actions");
const AppError = require("../utils/AppError");
const {
  createRecordSchema,
  updateRecordSchema,
  recordFilterSchema,
} = require("../validation/schemas");
const {
  createRecord,
  listRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} = require("../services/recordService");

const router = express.Router();
router.use(auth);

router.get(
  "/",
  authorize(ACTIONS.VIEW_RECORDS),
  asyncHandler(async (req, res) => {
    const parsed = recordFilterSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(400, "Validation failed.", parsed.error.flatten());
    }

    const result = await listRecords(parsed.data);
    res.status(200).json({
      success: true,
      data: result,
    });
  })
);

router.get(
  "/:id",
  authorize(ACTIONS.VIEW_RECORDS),
  asyncHandler(async (req, res) => {
    const record = await getRecordById(req.params.id);
    res.status(200).json({
      success: true,
      data: record,
    });
  })
);

router.post(
  "/",
  authorize(ACTIONS.MANAGE_RECORDS),
  validate(createRecordSchema),
  asyncHandler(async (req, res) => {
    const record = await createRecord(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: "Financial record created successfully.",
      data: record,
    });
  })
);

router.patch(
  "/:id",
  authorize(ACTIONS.MANAGE_RECORDS),
  validate(updateRecordSchema),
  asyncHandler(async (req, res) => {
    const record = await updateRecord(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Financial record updated successfully.",
      data: record,
    });
  })
);

router.delete(
  "/:id",
  authorize(ACTIONS.MANAGE_RECORDS),
  asyncHandler(async (req, res) => {
    await deleteRecord(req.params.id);
    res.status(200).json({
      success: true,
      message: "Financial record deleted successfully.",
    });
  })
);

module.exports = router;
