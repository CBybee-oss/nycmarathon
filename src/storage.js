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
const cloudStore = {
  async get() {
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
  async set(value) {
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

// ── Auth helpers (magic-link / email OTP) ──
export async function getSession() {
  if (!cloudEnabled) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function sendMagicLink(email) {
  if (!cloudEnabled) throw new Error("cloud not configured");
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut() {
  if (cloudEnabled) await supabase.auth.signOut();
}

export function onAuthChange(cb) {
  if (!cloudEnabled) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}
