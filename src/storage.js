import { createClient } from "@supabase/supabase-js";

// Config comes from Vite env vars (set in Netlify, or a local .env file).
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

export const cloudEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const supabase = cloudEnabled
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

const STATE_KEY = "nyc-marathon-26-state";

// ── Local fallback (used only when cloud isn't configured) ──
const localStore = {
  async get() {
    const value = localStorage.getItem(STATE_KEY);
    return value == null ? null : { value };
  },
  async set(value) {
    localStorage.setItem(STATE_KEY, value);
    return { value };
  },
};

// ── Cloud store: one row per user in `training_state`, guarded by RLS ──
// NOTE: callers use the (key, value) convention from the local-storage shim
// (see window.storage in main.jsx). The cloud store only needs the value —
// it's a single row per user — so it reads whichever arg is the actual
// payload, accepting either get(key) / set(key, value) or get() / set(value).
const cloudStore = {
  async get(_key) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("training_state")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    return data ? { value: JSON.stringify(data.data) } : null;
  },
  async set(keyOrValue, maybeValue) {
    const value = maybeValue !== undefined ? maybeValue : keyOrValue;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("not signed in");
    const { error } = await supabase
      .from("training_state")
      .upsert({ user_id: user.id, data: JSON.parse(value), updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) throw error;
    return { value };
  },
};

// Unified interface the app's window.storage shim wraps.
export const store = cloudEnabled ? cloudStore : localStore;

// ── Auth helpers (email + password) ──
export async function getSession() {
  if (!cloudEnabled) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signInWithPassword(email, password) {
  if (!cloudEnabled) throw new Error("cloud not configured");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  if (cloudEnabled) await supabase.auth.signOut();
}

export async function updatePassword(password) {
  if (!cloudEnabled) throw new Error("cloud not configured");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export function onAuthChange(cb) {
  if (!cloudEnabled) return () => {};
  const { data } = supabase.auth.onAuthStateChange((event, session) => cb(session, event));
  return () => data.subscription.unsubscribe();
}
