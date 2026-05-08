import { createContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { clearToken, getToken, setToken } from "../utils/tokenStorage";
import { fetchCurrentUser, loginUser, registerUser } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchCurrentUser()
      .then((profile) => setUser(profile))
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      async register(payload) {
        const result = await registerUser(payload);
        setToken(result.token);
        setUser(result.user);
        toast.success("Account created successfully.");
      },
      async login(payload) {
        const result = await loginUser(payload);
        setToken(result.token);
        setUser(result.user);
        toast.success("Logged in successfully.");
      },
      logout() {
        clearToken();
        setUser(null);
        toast.info("Logged out.");
      }
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
