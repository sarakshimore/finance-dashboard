import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

export function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await register({ fullName, email, password });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <p className="text-sm text-slate-500">Create your account.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" placeholder="Full Name" required />
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required />
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" required />
            <Button disabled={loading} className="w-full">{loading ? "Creating account..." : "Register"}</Button>
          </form>
          <p className="mt-4 text-sm text-slate-600">Already have an account? <Link className="text-slate-900 underline" to="/login">Login</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
