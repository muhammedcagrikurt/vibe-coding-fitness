import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

let supabase;
if (!url || !key) {
  // provide a minimal fake client for auth methods
  console.warn("Supabase environment variables missing; using fake client");
  supabase = {
    auth: {
      _session: null as unknown,
      _user: null as unknown,
      session() {
        return this._session;
      },
      user() {
        return this._user;
      },
      onAuthStateChange(fn: (event: string, session: unknown) => void) {
        // no-op
        return { data: null };
      },
      async signIn(creds: { email: string; password: string }) {
        // always succeed but return a fake user
        this._user = { id: "fake-" + (creds.email || "user"), email: creds.email };
        this._session = { access_token: "dummy" };
        return { error: null, session: this._session, user: this._user };
      },
      async signUp(creds: { email: string; password: string }) {
        this._user = { id: "fake-" + (creds.email || "user"), email: creds.email };
        return { error: null, user: this._user };
      },
      async signOut() {
        this._session = null;
        this._user = null;
      },
      async setSession(token: string) {
        this._session = { access_token: token };
        // also set a dummy user when session is set
        this._user = { id: "guest", email: "guest@local" };
      },
    },
  };
} else {
  supabase = createClient(url, key);
}

export { supabase };
