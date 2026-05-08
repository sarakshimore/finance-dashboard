import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

function NavItem({ to, label }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`rounded-md px-3 py-2 text-sm font-medium ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"}`}
    >
      {label}
    </Link>
  );
}

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-slate-900">Finance Dashboard</h1>
          <div className="flex items-center gap-2">
            <NavItem to="/dashboard" label="Dashboard" />
            <NavItem to="/records" label="Records" />
            {user?.role === "admin" ? <NavItem to="/users" label="Users" /> : null}
          </div>
          <div className="flex items-center gap-3">
            <Badge>{user?.role}</Badge>
            <span className="text-sm text-slate-600">{user?.fullName}</span>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
