function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    amount: Number(row.amount),
    type: row.record_type,
    category: row.category,
    date: row.record_date,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { mapUser, mapRecord };
