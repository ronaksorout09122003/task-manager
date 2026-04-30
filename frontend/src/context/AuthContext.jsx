import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/resources";
import { clearStoredToken, getStoredToken, setStoredToken } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await authApi.me();
        if (isMounted) setUser(data.user);
      } catch (_error) {
        clearStoredToken();
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    const handleLogout = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const authenticate = async (request, payload) => {
    const { data } = await request(payload);
    setStoredToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const refreshUser = async () => {
    const { data } = await authApi.me();
    setUser(data.user);
    return data.user;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login: (payload) => authenticate(authApi.login, payload),
      changePassword: (payload) => authApi.changePassword(payload),
      refreshUser,
      logout: () => {
        clearStoredToken();
        setToken(null);
        setUser(null);
      },
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
