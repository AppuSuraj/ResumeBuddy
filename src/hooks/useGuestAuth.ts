import { useState, useEffect, useCallback } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export interface UseGuestAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  loginWithGuestCredentials: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export function useGuestAuth(): UseGuestAuthReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Check for an existing session on mount
    const initializeAuth = async () => {
      try {
        if (!isSupabaseConfigured) {
          if (isMounted) setLoading(false);
          return;
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('[useGuestAuth] Error retrieving session:', sessionError.message);
        }
        if (isMounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.warn('[useGuestAuth] Session initialization failed:', err);
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, updatedSession: Session | null) => {
        if (!isMounted) return;
        setSession(updatedSession);
        setUser(updatedSession?.user ?? null);
        if (updatedSession) {
          setError(null);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginWithGuestCredentials = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setError(null);

      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      if (!trimmedEmail || !trimmedPassword) {
        const msg = 'Please enter both your Guest ID / Email and Access Key.';
        setError(msg);
        return { success: false, error: msg };
      }

      if (!isSupabaseConfigured) {
        const msg =
          'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not configured.';
        setError(msg);
        return { success: false, error: msg };
      }

      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });

        if (signInError) {
          let userFriendlyMessage = signInError.message;
          // Handle specific revocation / suspension messages
          if (
            signInError.message.toLowerCase().includes('banned') ||
            signInError.message.toLowerCase().includes('revoked')
          ) {
            userFriendlyMessage = 'This guest account has been revoked or suspended.';
          } else if (signInError.message.toLowerCase().includes('invalid login credentials')) {
            userFriendlyMessage = 'Invalid Guest ID or Access Key. Please check your credentials.';
          }

          setError(userFriendlyMessage);
          return { success: false, error: userFriendlyMessage };
        }

        setSession(data.session);
        setUser(data.user);
        setError(null);
        return { success: true };
      } catch (err: any) {
        const fallbackMsg =
          err?.message || 'Authentication service unreachable. Please check network connection.';
        setError(fallbackMsg);
        return { success: false, error: fallbackMsg };
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[useGuestAuth] Error during signOut:', err);
    } finally {
      // Clear session state in memory without clearing any local resume data
      setSession(null);
      setUser(null);
      setError(null);
    }
  }, []);

  return {
    user,
    session,
    loading,
    error,
    isConfigured: isSupabaseConfigured,
    loginWithGuestCredentials,
    logout,
  };
}
