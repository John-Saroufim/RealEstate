import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /** Never block the app on auth init longer than 2s (protected routes + splash). */
    const forceReady = window.setTimeout(() => {
      setLoading(false);
    }, 2000);

    /**
     * Apply auth session without awaiting `getUser()` first — that await inside
     * `onAuthStateChange` can deadlock the Supabase JS client, leaving `loading`
     * true forever (protected routes show a permanent spinner until refresh).
     * See: https://github.com/supabase/supabase-js/issues/762
     */
    const applySession = (session: Session | null) => {
      if (!session) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      setSession(session);
      setUser(session.user);
      setLoading(false);

      void supabase.auth
        .getUser()
        .then(({ data: { user: freshUser } }) => {
          if (freshUser) setUser(freshUser);
        })
        .catch(() => {
          /* non-fatal; session.user remains */
        });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => applySession(session));
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
    });

    return () => {
      clearTimeout(forceReady);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
