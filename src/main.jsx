import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import NYCMarathonPlan from "./NYCMarathonPlan.jsx";
import { store, cloudEnabled, getSession, signInWithPassword, signOut, onAuthChange, updatePassword } from "./storage.js";

window.storage = {
  async get(key) { return store.get(key); },
  async set(key, value) { return store.set(key, value); },
};

const display = { fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" };
const mono = { fontFamily: "'DM Mono', monospace" };

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.includes("@")) { setErr("Enter a valid email."); return; }
    if (!password) { setErr("Enter your password."); return; }
    setBusy(true); setErr("");
    try { await signInWithPassword(email.trim(), password); }
    catch (e) { setErr(e.message || "Something went wrong."); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ ...mono, minHeight: "100vh", background: "#080808", color: "#e4e4e7", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&display=swap');`}</style>
      <div style={{ maxWidth: 360, width: "100%" }}>
        <div style={{ ...display, fontSize: 38, lineHeight: 0.95 }}>NYC MARATHON <span style={{ color: "#fb923c" }}>26</span></div>
        <div style={{ fontSize: 10.5, color: "#71717a", marginTop: 4, marginBottom: 24 }}>SUB-4:20 BUILD — CAMERON</div>
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", padding: 18 }}>
          <input type="email" value={email} placeholder="you@email.com" autoComplete="email"
            onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
            style={{ width: "100%", background: "#080808", color: "#e4e4e7", border: "1px solid #27272a", fontFamily: "inherit", fontSize: 14, padding: "10px 12px", marginBottom: 10, boxSizing: "border-box" }} />
          <input type="password" value={password} placeholder="password" autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
            style={{ width: "100%", background: "#080808", color: "#e4e4e7", border: "1px solid #27272a", fontFamily: "inherit", fontSize: 14, padding: "10px 12px", marginBottom: 10, boxSizing: "border-box" }} />
          {err && <div style={{ fontSize: 10, color: "#f43f5e", marginBottom: 10 }}>{err}</div>}
          <button onClick={submit} disabled={busy}
            style={{ ...display, width: "100%", fontSize: 16, padding: "10px", background: busy ? "#27272a" : "#e4e4e7", color: busy ? "#71717a" : "#080808", border: "none", cursor: busy ? "default" : "pointer" }}>
            {busy ? "SIGNING IN…" : "SIGN IN"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SetPassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setErr("Passwords don't match."); return; }
    setBusy(true); setErr("");
    try { await updatePassword(password); onDone(); }
    catch (e) { setErr(e.message || "Something went wrong."); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ ...mono, minHeight: "100vh", background: "#080808", color: "#e4e4e7", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&display=swap');`}</style>
      <div style={{ maxWidth: 360, width: "100%" }}>
        <div style={{ ...display, fontSize: 30, lineHeight: 0.95 }}>SET YOUR PASSWORD</div>
        <div style={{ fontSize: 10.5, color: "#71717a", marginTop: 4, marginBottom: 24 }}>YOU'LL USE THIS TO SIGN IN FROM NOW ON</div>
        <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", padding: 18 }}>
          <input type="password" value={password} placeholder="new password" autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", background: "#080808", color: "#e4e4e7", border: "1px solid #27272a", fontFamily: "inherit", fontSize: 14, padding: "10px 12px", marginBottom: 10, boxSizing: "border-box" }} />
          <input type="password" value={confirm} placeholder="confirm password" autoComplete="new-password"
            onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
            style={{ width: "100%", background: "#080808", color: "#e4e4e7", border: "1px solid #27272a", fontFamily: "inherit", fontSize: 14, padding: "10px 12px", marginBottom: 10, boxSizing: "border-box" }} />
          {err && <div style={{ fontSize: 10, color: "#f43f5e", marginBottom: 10 }}>{err}</div>}
          <button onClick={submit} disabled={busy}
            style={{ ...display, width: "100%", fontSize: 16, padding: "10px", background: busy ? "#27272a" : "#e4e4e7", color: busy ? "#71717a" : "#080808", border: "none", cursor: busy ? "default" : "pointer" }}>
            {busy ? "SAVING…" : "SAVE PASSWORD"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Root() {
  const [ready, setReady] = useState(!cloudEnabled);
  const [authed, setAuthed] = useState(!cloudEnabled);
  const [recovery, setRecovery] = useState(false);
  const [settingPassword, setSettingPassword] = useState(false);

  useEffect(() => {
    if (!cloudEnabled) return;
    getSession().then((s) => {
