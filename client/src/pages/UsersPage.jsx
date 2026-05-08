import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import {
  createViewerUser,
  deactivateUser,
  deleteUserPermanently,
  fetchUsers,
  updateUser,
} from "../services/userService";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

export function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: "", status: "active" });

  const isAdmin = user?.role === "admin";

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await fetchUsers();
      setUsers(result);
    } catch (error) {
      toast.error(error.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  if (!isAdmin) {
    return <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">Only admins can manage users.</p>;
  }

  const onCreate = async (event) => {
    event.preventDefault();
    try {
      await createViewerUser(form);
      toast.success("Viewer created.");
      setForm({ fullName: "", email: "", password: "" });
      loadUsers();
    } catch (error) {
      toast.error(error.message || "Failed to create user.");
    }
  };

  const onSaveEdit = async (userId) => {
    try {
      await updateUser(userId, editForm);
      toast.success("User updated.");
      setEditingId(null);
      loadUsers();
    } catch (error) {
      toast.error(error.message || "Failed to update user.");
    }
  };

  const onDeactivate = async (userId) => {
    try {
      await deactivateUser(userId);
      toast.success("User deactivated.");
      loadUsers();
    } catch (error) {
      toast.error(error.message || "Failed to deactivate user.");
    }
  };

  const onPermanentDelete = async (userId) => {
    try {
      await deleteUserPermanently(userId);
      toast.success("User deleted permanently.");
      loadUsers();
    } catch (error) {
      toast.error(error.message || "Failed to delete user.");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Create Viewer</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid gap-3 md:grid-cols-3">
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" required />
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="Email" required />
            <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" placeholder="Password" required />
            <Button className="md:col-span-3">Create Viewer</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Users</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-slate-600">Loading users...</p> : null}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Status</th><th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="p-2">
                      {editingId === row.id ? (
                        <Input value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
                      ) : row.fullName}
                    </td>
                    <td className="p-2">{row.email}</td>
                    <td className="p-2">{row.role}</td>
                    <td className="p-2">
                      {editingId === row.id ? (
                        <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                          <option value="active">active</option>
                          <option value="inactive">inactive</option>
                        </select>
                      ) : row.status}
                    </td>
                    <td className="p-2">
                      {editingId === row.id ? (
                        <>
                          <Button className="mr-2" onClick={() => onSaveEdit(row.id)}>Save</Button>
                          <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button
                            className="mr-2"
                            variant="secondary"
                            onClick={() => {
                              setEditingId(row.id);
                              setEditForm({ fullName: row.fullName, status: row.status });
                            }}
                          >
                            Edit
                          </Button>
                          <Button className="mr-2" variant="outline" onClick={() => onDeactivate(row.id)}>Deactivate</Button>
                          <Button variant="danger" onClick={() => onPermanentDelete(row.id)}>Delete</Button>
                        </>
                      )}
                    </td>
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
