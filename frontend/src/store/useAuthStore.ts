import create from "zustand";
import { supabase } from "../lib/supabaseClient";
import api from "../lib/api";
import { toast } from "react-hot-toast";
import { SessionResponse } from "../types";

interface AuthState {
  user: SessionResponse["user"] | null;
  session: SessionResponse | null;
  isGuest: boolean;
  loading: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isGuest: false,
  loading: false,
  initialize: async () => {
    set({ loading: true });
    const session = supabase.auth.session();
    const user = supabase.auth.user();
    const stored = localStorage.getItem("isGuest") === "true";
    set({ session, user, isGuest: stored, loading: false });
    supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user || null;
      const storedFlag = localStorage.getItem("isGuest") === "true";
      set({ session, user: u, isGuest: storedFlag });
    });
  },
  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { error, session, user } = await supabase.auth.signIn({ email, password });
      if (error) throw error;
      localStorage.removeItem("isGuest");
      set({ session, user, isGuest: false });
      toast.success("Signed in");
    } catch (err: unknown) {
      console.error(err);
      const e = err as any;
      toast.error(e.message || "Sign-in failed");
    }
    set({ loading: false });
  },
  signUp: async (email, password) => {
    set({ loading: true });
    try {
      const { error, user } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success("Sign up successful; please check your email");
    } catch (err: unknown) {
      console.error(err);
      const e = err as any;
      toast.error(e.message || "Sign-up failed");
    }
    set({ loading: false });
  },
  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    localStorage.removeItem("isGuest");
    set({ user: null, session: null, isGuest: false, loading: false });
  },
  loginAsGuest: async () => {
    set({ loading: true });
    try {
      const resp = await api.post("/auth/guest");
      const session: SessionResponse = resp.data;
      await supabase.auth.setSession(session.access_token);
      const user = supabase.auth.user();
      localStorage.setItem("isGuest", "true");
      set({ session, user, isGuest: true });
      toast.success("Logged in as guest");
    } catch (e: unknown) {
      console.error(e);
      toast.error("Failed to log in as guest");
    }
    set({ loading: false });
  },
}));
