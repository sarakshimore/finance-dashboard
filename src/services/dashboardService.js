const pool = require("../config/db");
const { buildRecordFilterClause } = require("./recordService");

async function getSummary(filters) {
  const { whereClause, params } = buildRecordFilterClause(filters);

  const { rows } = await pool.query(
    `
    SELECT
      COALESCE(SUM(CASE WHEN record_type = 'income' THEN amount ELSE 0 END), 0)::NUMERIC(14,2) AS total_income,
      COALESCE(SUM(CASE WHEN record_type = 'expense' THEN amount ELSE 0 END), 0)::NUMERIC(14,2) AS total_expense
    FROM financial_records
    ${whereClause}
    `,
    params
  );

  const row = rows[0];
  const totalIncome = Number(row.total_income);
  const totalExpense = Number(row.total_expense);

  return {
    totalIncome,
    totalExpense,
    netBalance: Number((totalIncome - totalExpense).toFixed(2)),
  };
}

async function getCategoryTotals(filters) {
  const { whereClause, params } = buildRecordFilterClause(filters);

  const { rows } = await pool.query(
    `
    SELECT
      category,
      COALESCE(SUM(CASE WHEN record_type = 'income' THEN amount ELSE 0 END), 0)::NUMERIC(14,2) AS income_total,
      COALESCE(SUM(CASE WHEN record_type = 'expense' THEN amount ELSE 0 END), 0)::NUMERIC(14,2) AS expense_total
    FROM financial_records
    ${whereClause}
    GROUP BY category
    ORDER BY category ASC
    `,
    params
  );

  return rows.map((row) => {
    const incomeTotal = Number(row.income_total);
    const expenseTotal = Number(row.expense_total);

    return {
      category: row.category,
      incomeTotal,
      expenseTotal,
      netTotal: Number((incomeTotal - expenseTotal).toFixed(2)),
    };
  });
}

async function getTrends({ period, startDate, endDate }) {
  const bucketExpr =
    period === "weekly"
      ? "TO_CHAR(record_date, 'IYYY-\"W\"IW')"
      : "TO_CHAR(record_date, 'YYYY-MM')";

  const { whereClause, params } = buildRecordFilterClause({
    startDate,
    endDate,
  });

  const { rows } = await pool.query(
    `
    SELECT
      ${bucketExpr} AS bucket,
      COALESCE(SUM(CASE WHEN record_type = 'income' THEN amount ELSE 0 END), 0)::NUMERIC(14,2) AS total_income,
      COALESCE(SUM(CASE WHEN record_type = 'expense' THEN amount ELSE 0 END), 0)::NUMERIC(14,2) AS total_expense
    FROM financial_records
    ${whereClause}
    GROUP BY bucket
    ORDER BY bucket ASC
    `,
    params
  );

  return rows.map((row) => {
    const totalIncome = Number(row.total_income);
    const totalExpense = Number(row.total_expense);

    return {
      bucket: row.bucket,
      totalIncome,
      totalExpense,
      net: Number((totalIncome - totalExpense).toFixed(2)),
    };
  });
}

async function getRecentActivity(limit = 10) {
  const { rows } = await pool.query(
    `
    SELECT id, amount, record_type, category, record_date, notes, created_by, created_at, updated_at
    FROM financial_records
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT $1
    `,
    [limit]
  );

  return rows.map((row) => ({
    id: row.id,
    type: row.record_type,
    amount: Number(row.amount),
    category: row.category,
    date: row.record_date,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
  }));
}

module.exports = {
  getSummary,
  getCategoryTotals,
  getTrends,
  getRecentActivity,
};
