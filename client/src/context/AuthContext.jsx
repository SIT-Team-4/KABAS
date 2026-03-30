import React from "react";
import { getMe, login as loginRequest } from "../api/authApi";
import { clearToken, getToken, setToken } from "../api/tokenStore";

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      const existingToken = getToken();
      if (!existingToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const me = await getMe();
        if (!isMounted) return;
        setUser(me);
      } catch {
        clearToken();
        if (!isMounted) return;
        setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = React.useCallback(async ({ email, password, rememberMe }) => {
    const result = await loginRequest({ email, password });
    setToken(result.token, { remember: rememberMe });
    setUser(result.user);
    return result.user;
  }, []);

  const logout = React.useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
