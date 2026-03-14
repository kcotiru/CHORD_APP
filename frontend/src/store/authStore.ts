import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import { registerJwtGetter } from '../api/client';

const supabaseUrl  = process.env.EXPO_PUBLIC_SUPABASE_URL  ?? '';
const supabaseAnon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});

interface AuthState {
  // ── State ──────────────────────────────────────────────────────────────────
  userId:       string | null;
  jwt:          string | null;
  email:        string | null;
  isGuest:      boolean;
  isLoading:    boolean;
  authError:    string | null;

  // ── Derived ────────────────────────────────────────────────────────────────
  isAuthenticated: boolean;
  canEdit:         boolean;   // true when signed in (not guest)

  // ── Actions ────────────────────────────────────────────────────────────────
  signIn:       (email: string, password: string) => Promise<void>;
  signUp:       (email: string, password: string) => Promise<void>;
  signOut:      () => Promise<void>;
  continueAsGuest: () => void;
  initialize:   () => Promise<void>;
  clearError:   () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Register JWT getter so the API client can read it without importing the store
  registerJwtGetter(() => get().jwt);

  return {
    userId:  null,
    jwt:     null,
    email:   null,
    isGuest: false,
    isLoading: true,
    authError: null,

    get isAuthenticated() { return get().jwt !== null && !get().isGuest; },
    get canEdit()         { return get().jwt !== null && !get().isGuest; },

    initialize: async () => {
      set({ isLoading: true });
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        set({
          userId:    session.user.id,
          jwt:       session.access_token,
          email:     session.user.email ?? null,
          isGuest:   false,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      // Keep the store in sync when the token refreshes
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          set({
            userId:  session.user.id,
            jwt:     session.access_token,
            email:   session.user.email ?? null,
            isGuest: false,
          });
        } else {
          set({ userId: null, jwt: null, email: null, isGuest: false });
        }
      });
    },

    signIn: async (email, password) => {
      set({ isLoading: true, authError: null });
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        set({ isLoading: false, authError: error?.message ?? 'Sign in failed' });
        return;
      }
      set({
        userId:    data.session.user.id,
        jwt:       data.session.access_token,
        email:     data.session.user.email ?? null,
        isGuest:   false,
        isLoading: false,
      });
    },

    signUp: async (email, password) => {
      set({ isLoading: true, authError: null });
      const { error, data } = await supabase.auth.signUp({ email, password });
      if (error) {
        set({ isLoading: false, authError: error.message });
        return;
      }
      // Supabase may require email confirmation — session may be null
      if (data.session) {
        set({
          userId:    data.session.user.id,
          jwt:       data.session.access_token,
          email:     data.session.user.email ?? null,
          isGuest:   false,
          isLoading: false,
        });
      } else {
        set({ isLoading: false, authError: 'Check your email to confirm your account.' });
      }
    },

    signOut: async () => {
      await supabase.auth.signOut();
      set({ userId: null, jwt: null, email: null, isGuest: false });
    },

    continueAsGuest: () => {
      set({ isGuest: true, userId: null, jwt: null, email: null });
    },

    clearError: () => set({ authError: null }),
  };
});
