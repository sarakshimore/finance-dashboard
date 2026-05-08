const express = require("express");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const asyncHandler = require("../utils/asyncHandler");
const { ACTIONS } = require("../constants/actions");
const AppError = require("../utils/AppError");
const {
  dashboardFilterSchema,
  trendQuerySchema,
  recentActivitySchema,
} = require("../validation/schemas");
const {
  getSummary,
  getCategoryTotals,
  getTrends,
  getRecentActivity,
} = require("../services/dashboardService");

const router = express.Router();
router.use(auth);
router.use(authorize(ACTIONS.VIEW_DASHBOARD));

router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const parsed = dashboardFilterSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(400, "Validation failed.", parsed.error.flatten());
    }

    const data = await getSummary(parsed.data);
    res.status(200).json({ success: true, data });
  })
);

router.get(
  "/category-totals",
  asyncHandler(async (req, res) => {
    const parsed = dashboardFilterSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(400, "Validation failed.", parsed.error.flatten());
    }

    const data = await getCategoryTotals(parsed.data);
    res.status(200).json({ success: true, data });
  })
);

router.get(
  "/trends",
  asyncHandler(async (req, res) => {
    const parsed = trendQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(400, "Validation failed.", parsed.error.flatten());
    }

    const data = await getTrends(parsed.data);
    res.status(200).json({ success: true, data });
  })
);

router.get(
  "/recent-activity",
  asyncHandler(async (req, res) => {
    const parsed = recentActivitySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(400, "Validation failed.", parsed.error.flatten());
    }

    const data = await getRecentActivity(parsed.data.limit);
    res.status(200).json({ success: true, data });
  })
);

module.exports = router;
