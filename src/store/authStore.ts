// ── Auth store — Supabase Auth with Zustand ───────────────────────────────────
// Exports the shared `supabase` client used by all API modules.
// The client automatically attaches the current user's JWT to every request
// via its internal session management — no manual header injection needed.

import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.EXPO_PUBLIC_SUPABASE_URL  ?? '';
const supabaseAnon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Shared singleton — imported by all api/* modules
export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    autoRefreshToken:  true,
    persistSession:    true,
    detectSessionInUrl: false,
  },
});

interface AuthState {
  userId:    string | null;
  email:     string | null;
  isGuest:   boolean;
  isLoading: boolean;
  authError: string | null;

  isAuthenticated: boolean;
  canEdit:         boolean;

  signIn:          (email: string, password: string) => Promise<void>;
  signUp:          (email: string, password: string) => Promise<void>;
  signOut:         () => Promise<void>;
  continueAsGuest: () => void;
  initialize:      () => Promise<void>;
  clearError:      () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userId:    null,
  email:     null,
  isGuest:   false,
  isLoading: true,
  authError: null,

  get isAuthenticated() { return get().userId !== null && !get().isGuest; },
  get canEdit()         { return get().userId !== null && !get().isGuest; },

  // ── Restore session on app launch ──────────────────────────────────────────
  initialize: async () => {
    set({ isLoading: true });

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      set({
        userId:    session.user.id,
        email:     session.user.email ?? null,
        isGuest:   false,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }

    // Keep store in sync on token refresh or sign-out from another tab
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        set({
          userId:  session.user.id,
          email:   session.user.email ?? null,
          isGuest: false,
        });
      } else {
        set({ userId: null, email: null, isGuest: false });
      }
    });
  },

  // ── Sign in ────────────────────────────────────────────────────────────────
  signIn: async (email, password) => {
    set({ isLoading: true, authError: null });
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      set({ isLoading: false, authError: error?.message ?? 'Sign in failed' });
      return;
    }
    set({
      userId:    data.session.user.id,
      email:     data.session.user.email ?? null,
      isGuest:   false,
      isLoading: false,
    });
  },

  // ── Sign up ────────────────────────────────────────────────────────────────
  signUp: async (email, password) => {
    set({ isLoading: true, authError: null });
    const { error, data } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ isLoading: false, authError: error.message });
      return;
    }
    if (data.session) {
      set({
        userId:    data.session.user.id,
        email:     data.session.user.email ?? null,
        isGuest:   false,
        isLoading: false,
      });
    } else {
      // Email confirmation required
      set({
        isLoading: false,
        authError: 'Check your email to confirm your account.',
      });
    }
  },

  // ── Sign out ───────────────────────────────────────────────────────────────
  signOut: async () => {
    await supabase.auth.signOut();
    set({ userId: null, email: null, isGuest: false });
  },

  // ── Guest mode ─────────────────────────────────────────────────────────────
  continueAsGuest: () => {
    set({ isGuest: true, userId: null, email: null });
  },

  clearError: () => set({ authError: null }),
}));
