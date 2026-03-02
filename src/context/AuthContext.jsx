import { createContext, useContext, useEffect, useState, useCallback } from "react";

// ─────────────────────────────────────────────
//  Mock user database
// ─────────────────────────────────────────────
const MOCK_USERS = {
  admin: {
    id: "nb-admin-001",
    name: "Dr. Priya Nair",
    email: "admin@neurobridge.in",
    role: "admin",
    abhaId: "27-4567-8901-2345",
    designation: "Lead Clinical Coordinator",
  },
  user: {
    id: "nb-user-042",
    name: "Arun Kumar",
    email: "arun@neurobridge.in",
    role: "user",
    abhaId: "14-2345-6789-0123",
    selectedProfile: null,
    accessibility: {
      reduceMotion: false,
      screenReader: false,
    },
  },
};

// ─────────────────────────────────────────────
//  Context
// ─────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // hydrating from storage

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nb_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setIsAuthenticated(true);
      }
    } catch {
      localStorage.removeItem("nb_auth");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── mock login ─────────────────────────────
  // Returns a Promise so the Login page can await it and show a spinner.
  // Swap the setTimeout internals for a real fetch() when backend is ready.
  const login = useCallback((role) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockUser = MOCK_USERS[role];
        if (!mockUser) {
          reject(new Error("Invalid role"));
          return;
        }
        // Merge any persisted user prefs from previous session
        const persisted = (() => {
          try {
            return JSON.parse(localStorage.getItem(`nb_prefs_${mockUser.id}`) || "{}");
          } catch {
            return {};
          }
        })();
        const fullUser = { ...mockUser, ...persisted };
        localStorage.setItem("nb_auth", JSON.stringify(fullUser));
        setUser(fullUser);
        setIsAuthenticated(true);
        resolve(fullUser);
      }, 900); // simulates network latency
    });
  }, []);

  // ── logout ─────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("nb_auth");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // ── update user profile (persists) ─────────
  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const updated = { ...prev, ...patch };
      localStorage.setItem("nb_auth", JSON.stringify(updated));
      localStorage.setItem(`nb_prefs_${prev.id}`, JSON.stringify(patch));
      return updated;
    });
  }, []);

  const value = {
    user,
    role: user?.role ?? null,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
