import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import NYCMarathonPlan from "./NYCMarathonPlan.jsx";
import { store, cloudEnabled, getSession, sendMagicLink, signOut, onAuthChange } from "./storage.js";

// Point the app's existing window.storage interface at our store (cloud or local).
window.storage = {
  async get(key) { return store.get(key); },
  async set(key, value) { return store.set(key, value); },
};

const display = { fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" };
const mono = { fontFamily: "'DM Mono', monospace" };

function SignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.includes("@")) { setErr("Enter a valid email."); return; }
    setBusy(true); setErr("");
    try { await sendMagicLink(email.trim()); setSent(true); }
    catch (e) { setErr(e.message || "Something went wrong."); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ ...mono, minHeight: "100vh", background: "#080808", color: "#e4e4e7", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&display=swap');`}</style>
      <div style={{ maxWidth: 360, width: "100%" }}>
        <div style={{ ...display, fontSize: 38, lineHeight: 0.95 }}>NYC MARATHON <span style={{ color: "#fb923c" }}>26</span></div>
        <div style={{ fontSize: 10.5, color: "#71717a", marginTop: 4, marginBottom: 24 }}>SUB-4:20 BUILD — CAMERON</div>
        {sent ? (
          <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", padding: 18 }}>
            <div style={{ ...display, fontSize: 20, color: "#4ade80", marginBottom: 8 }}>CHECK YOUR EMAIL</div>
            <div style={{ fontSize: 11, color: "#a1a1aa", lineHeight: 1.6 }}>
              Tap the link we sent to <span style={{ color: "#e4e4e7" }}>{email}</span> to sign in. It opens this app with your data synced. You can close this tab.
            </div>
            <button onClick={() => setSent(false)} style={{ marginTop: 14, fontSize: 10, padding: "6px 12px", background: "transparent", color: "#71717a", border: "1px solid #27272a", fontFamily: "inherit", cursor: "pointer" }}>USE A DIFFERENT EMAIL</button>
          </div>
        ) : (
          <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", padding: 18 }}>
            <div style={{ fontSize: 11, color: "#a1a1aa", lineHeight: 1.6, marginBottom: 14 }}>
              Sign in to sync your training across devices. No password — we email you a one-tap link.
            </div>
            <input type="email" value={email} placeholder="you@email.com" autoComplete="email"
              onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
              style={{ width: "100%", background: "#080808", color: "#e4e4e7", border: "1px solid #27272a", fontFamily: "inherit", fontSize: 14, padding: "10px 12px", marginBottom: 10, boxSizing: "border-box" }} />
            {err && <div style={{ fontSize: 10, color: "#f43f5e", marginBottom: 10 }}>{err}</div>}
            <button onClick={submit} disabled={busy}
              style={{ ...display, width: "100%", fontSize: 16, padding: "10px", background: busy ? "#27272a" : "#e4e4e7", color: busy ? "#71717a" : "#080808", border: "none", cursor: busy ? "default" : "pointer" }}>
              {busy ? "SENDING…" : "SEND SIGN-IN LINK"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Root() {
  const [ready, setReady] = useState(!cloudEnabled);
  const [authed, setAuthed] = useState(!cloudEnabled);

  useEffect(() => {
    if (!cloudEnabled) return;
    getSession().then((s) => { setAuthed(!!s); setReady(true); });
    const off = onAuthChange((s) => { setAuthed(!!s); setReady(true); });
    return off;
  }, []);

  if (!ready) {
    return (
      <div style={{ ...mono, minHeight: "100vh", background: "#080808", color: "#52525b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');`}</style>
        LOADING…
      </div>
    );
  }
  if (cloudEnabled && !authed) return <SignIn />;
  return (
    <>
      <NYCMarathonPlan />
      {cloudEnabled && (
        <button onClick={() => signOut()} title="Sign out"
          style={{ position: "fixed", bottom: 10, right: 10, zIndex: 50, ...mono, fontSize: 9, padding: "4px 9px", background: "#0d0d0d", color: "#52525b", border: "1px solid #1a1a1a", cursor: "pointer", opacity: 0.8 }}>
          SIGN OUT
        </button>
      )}
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
