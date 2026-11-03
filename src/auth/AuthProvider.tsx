import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../api/supabase";

interface AuthState {
  user: User | null;
  loading: boolean;
  /** True after the user opened a password-reset link: show the "new password" form. */
  recovering: boolean;
  clearRecovering: () => void;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true, recovering: false, clearRecovering: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      // Drop ?code=... from the address bar once Supabase has exchanged it.
      if (window.location.search.includes("code=")) {
        window.history.replaceState(null, "", window.location.pathname + window.location.hash);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user: session?.user ?? null, loading, recovering, clearRecovering: () => setRecovering(false) }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
