const { z } = require("zod");

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const roleSchema = z.enum(["viewer", "analyst", "admin"]);
const userStatusSchema = z.enum(["active", "inactive"]);
const recordTypeSchema = z.enum(["income", "expense"]);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const createUserSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: roleSchema,
  status: userStatusSchema.optional(),
});

const updateUserSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120).optional(),
    role: roleSchema.optional(),
    status: userStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update.",
  });

const createRecordSchema = z.object({
  amount: z.number().positive(),
  type: recordTypeSchema,
  category: z.string().trim().min(2).max(80),
  date: z.string().regex(dateRegex, "Date must be in YYYY-MM-DD format."),
  notes: z.string().trim().max(500).optional().nullable(),
});

const updateRecordSchema = z
  .object({
    amount: z.number().positive().optional(),
    type: recordTypeSchema.optional(),
    category: z.string().trim().min(2).max(80).optional(),
    date: z.string().regex(dateRegex, "Date must be in YYYY-MM-DD format.").optional(),
    notes: z.string().trim().max(500).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update.",
  });

const recordFilterSchema = z.object({
  startDate: z.string().regex(dateRegex).optional(),
  endDate: z.string().regex(dateRegex).optional(),
  category: z.string().trim().min(2).max(80).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  type: recordTypeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const dashboardFilterSchema = z.object({
  startDate: z.string().regex(dateRegex).optional(),
  endDate: z.string().regex(dateRegex).optional(),
});

const trendQuerySchema = z.object({
  period: z.enum(["monthly", "weekly"]).optional().default("monthly"),
  startDate: z.string().regex(dateRegex).optional(),
  endDate: z.string().regex(dateRegex).optional(),
});

const recentActivitySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

module.exports = {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  createRecordSchema,
  updateRecordSchema,
  recordFilterSchema,
  dashboardFilterSchema,
  trendQuerySchema,
  recentActivitySchema,
};
