const pool = require("../config/db");
const AppError = require("../utils/AppError");
const { mapRecord } = require("../utils/mappers");

function buildRecordFilterClause(filters = {}) {
  const clauses = ["deleted_at IS NULL"];
  const params = [];
  let position = 1;

  if (filters.startDate) {
    clauses.push(`record_date >= $${position++}`);
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    clauses.push(`record_date <= $${position++}`);
    params.push(filters.endDate);
  }
  if (filters.category) {
    clauses.push(`LOWER(category) = LOWER($${position++})`);
    params.push(filters.category);
  }
  if (filters.type) {
    clauses.push(`record_type = $${position++}`);
    params.push(filters.type);
  }
  if (filters.search) {
    clauses.push(`(category ILIKE $${position} OR COALESCE(notes, '') ILIKE $${position})`);
    params.push(`%${filters.search}%`);
    position += 1;
  }

  return {
    whereClause: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
    nextPosition: position,
  };
}

async function createRecord(payload, actorUserId) {
  const { rows } = await pool.query(
    `
    INSERT INTO financial_records (amount, record_type, category, record_date, notes, created_by)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, amount, record_type, category, record_date, notes, created_by, created_at, updated_at
    `,
    [
      payload.amount,
      payload.type,
      payload.category,
      payload.date,
      payload.notes || null,
      actorUserId,
    ]
  );

  return mapRecord(rows[0]);
}

async function listRecords(filters) {
  const { whereClause, params, nextPosition } = buildRecordFilterClause(filters);

  const limitPosition = nextPosition;
  const offsetPosition = nextPosition + 1;
  const values = [...params, filters.limit, filters.offset];

  const { rows } = await pool.query(
    `
    SELECT id, amount, record_type, category, record_date, notes, created_by, created_at, updated_at
    FROM financial_records
    ${whereClause}
    ORDER BY record_date DESC, created_at DESC
    LIMIT $${limitPosition}
    OFFSET $${offsetPosition}
    `,
    values
  );

  const { rows: countRows } = await pool.query(
    `
    SELECT COUNT(*)::INT AS total
    FROM financial_records
    ${whereClause}
    `,
    params
  );

  return {
    items: rows.map(mapRecord),
    pagination: {
      total: countRows[0].total,
      limit: filters.limit,
      offset: filters.offset,
    },
  };
}

async function getRecordById(recordId) {
  const { rows } = await pool.query(
    `
    SELECT id, amount, record_type, category, record_date, notes, created_by, created_at, updated_at
    FROM financial_records
    WHERE id = $1 AND deleted_at IS NULL
    `,
    [recordId]
  );

  if (rows.length === 0) {
    throw new AppError(404, "Financial record not found.");
  }

  return mapRecord(rows[0]);
}

async function updateRecord(recordId, payload) {
  await getRecordById(recordId);

  const updates = [];
  const values = [];
  let position = 1;

  if (payload.amount !== undefined) {
    updates.push(`amount = $${position++}`);
    values.push(payload.amount);
  }
  if (payload.type !== undefined) {
    updates.push(`record_type = $${position++}`);
    values.push(payload.type);
  }
  if (payload.category !== undefined) {
    updates.push(`category = $${position++}`);
    values.push(payload.category);
  }
  if (payload.date !== undefined) {
    updates.push(`record_date = $${position++}`);
    values.push(payload.date);
  }
  if (payload.notes !== undefined) {
    updates.push(`notes = $${position++}`);
    values.push(payload.notes);
  }

  updates.push(`updated_at = NOW()`);
  values.push(recordId);

  const { rows } = await pool.query(
    `
    UPDATE financial_records
    SET ${updates.join(", ")}
    WHERE id = $${position}
    RETURNING id, amount, record_type, category, record_date, notes, created_by, created_at, updated_at
    `,
    values
  );

  return mapRecord(rows[0]);
}

async function deleteRecord(recordId) {
  const { rowCount } = await pool.query(
    `
    UPDATE financial_records
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = $1 AND deleted_at IS NULL
    `,
    [recordId]
  );

  if (rowCount === 0) {
    throw new AppError(404, "Financial record not found.");
  }
}

module.exports = {
  createRecord,
  listRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  buildRecordFilterClause,
};
