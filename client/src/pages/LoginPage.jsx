import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

export function LoginPage() {
  const [email, setEmail] = useState("admin@finance.local");
  const [password, setPassword] = useState("admin12345");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      const nextPath = location.state?.from?.pathname || "/dashboard";
      navigate(nextPath, { replace: true });
    } catch (error) {
      toast.error(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <p className="text-sm text-slate-500">Access your finance dashboard.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required />
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" required />
            <Button disabled={loading} className="w-full">{loading ? "Signing in..." : "Login"}</Button>
          </form>
          <p className="mt-4 text-sm text-slate-600">No account? <Link className="text-slate-900 underline" to="/register">Register</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
