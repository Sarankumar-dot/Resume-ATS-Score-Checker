// Auth Context — manages authentication state across the app.
// Access token stored in memory (NOT localStorage), refresh via httpOnly cookie.

import { createContext, useContext, useState, useEffect } from "react";
import { api, setAccessToken, refreshToken } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await refreshToken();
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch {
        // No valid refresh token — user is not logged in
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /**
   * Sign up with email, password, and name.
   */
  const signup = async (email, password, name) => {
    const data = await api.post("/auth/signup", { email, password, name });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  /**
   * Log in with email and password.
   */
  const login = async (email, password) => {
    const data = await api.post("/auth/login", { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  /**
   * Sign in with Google using the ID token from @react-oauth/google.
   */
  const googleLogin = async (idToken) => {
    const data = await api.post("/auth/google", { idToken });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  /**
   * Log out — clear session.
   */
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Even if the API call fails, clear local state
    }
    setAccessToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signup,
    login,
    googleLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context.
 * @returns {{ user, loading, isAuthenticated, signup, login, googleLogin, logout }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
