import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { createRecord, deleteRecord, fetchRecords, updateRecord } from "../services/recordService";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

const emptyForm = { amount: "", type: "income", category: "", date: "", notes: "" };

export function RecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const canManage = user?.role === "admin";

  const loadRecords = async () => {
    setLoading(true);
    try {
      const result = await fetchRecords({ limit: 20, offset: 0 });
      setRecords(result.items);
    } catch (error) {
      toast.error(error.message || "Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...form, amount: Number(form.amount) };
    try {
      if (editingId) {
        await updateRecord(editingId, payload);
        toast.success("Record updated.");
      } else {
        await createRecord(payload);
        toast.success("Record created.");
      }
      setForm(emptyForm);
      setEditingId(null);
      loadRecords();
    } catch (error) {
      toast.error(error.message || "Failed to save record.");
    }
  };

  const startEdit = (record) => {
    setEditingId(record.id);
    setForm({ amount: String(record.amount), type: record.type, category: record.category, date: record.date?.slice(0, 10), notes: record.notes || "" });
  };

  const handleDelete = async (recordId) => {
    try {
      await deleteRecord(recordId);
      toast.success("Record deleted.");
      loadRecords();
    } catch (error) {
      toast.error(error.message || "Failed to delete record.");
    }
  };

  return (
    <div className="space-y-6">
      {canManage ? (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Edit Record" : "Create Record"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-5">
              <Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} type="number" step="0.01" placeholder="Amount" required />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} type="text" placeholder="Category" required />
              <Input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} type="date" required />
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} type="text" placeholder="Notes" />
              <Button className="md:col-span-5">{editingId ? "Update Record" : "Create Record"}</Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">Viewer role has read-only record access.</p>
      )}

      <Card>
        <CardHeader><CardTitle>Financial Records</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-slate-600">Loading records...</p> : null}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="p-2">Date</th><th className="p-2">Type</th><th className="p-2">Category</th><th className="p-2">Amount</th><th className="p-2">Notes</th>{canManage ? <th className="p-2">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100">
                    <td className="p-2">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="p-2">{record.type}</td>
                    <td className="p-2">{record.category}</td>
                    <td className="p-2">{record.amount}</td>
                    <td className="p-2">{record.notes || "-"}</td>
                    {canManage ? (
                      <td className="p-2">
                        <Button variant="secondary" className="mr-2" onClick={() => startEdit(record)}>Edit</Button>
                        <Button variant="danger" onClick={() => handleDelete(record.id)}>Delete</Button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
