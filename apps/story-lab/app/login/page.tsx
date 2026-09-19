"use client";

import { useEffect, useState } from "react";

export default function LoginPage() {
  const [backend, setBackend] = useState<"UNKNOWN" | "EPHEMERAL" | "DURABLE">(
    "UNKNOWN"
  );
  const [signupEnabled, setSignupEnabled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Checking backend…");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        setBackend(data.backend ?? "EPHEMERAL");
        setSignupEnabled(Boolean(data.signupEnabled));
        setMessage(
          data.backend === "DURABLE"
            ? data.authenticated
              ? "A session is already active."
              : "Durable authentication is available."
            : "Supabase is not configured. Story Lab is running in preview mode."
        );
      })
      .catch(() => setMessage("Could not read authentication status."));
  }, []);

  async function submit(mode: "sign-in" | "sign-up") {
    setBusy(true);
    setMessage(mode === "sign-in" ? "Signing in…" : "Creating account…");

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message ?? data.error ?? "Authentication failed.");
        return;
      }

      if (mode === "sign-in") {
        window.location.href = "/production";
        return;
      }

      setMessage(
        data.sessionCreated
          ? "Account created and session started."
          : "Account created. Check your email if confirmation is required."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="review-shell">
      <a className="back-link" href="/">← Story Lab</a>
      <div className="eyebrow">CREATOR IDENTITY</div>
      <h1>Sign in</h1>
      <p className="muted review-intro">
        Durable Creator Authority requires an authenticated Supabase session.
      </p>

      <article className="review-card auth-card">
        <span
          className={`status ${backend === "DURABLE" ? "canon" : "candidate"}`}
        >
          BACKEND:{backend}
        </span>

        <label className="provider-token-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="provider-token-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>

        <div className="review-actions">
          {signupEnabled ? (
            <button
              className="secondary"
              type="button"
              disabled={busy || backend !== "DURABLE"}
              onClick={() => submit("sign-up")}
            >
              Create account
            </button>
          ) : null}

          <button
            type="button"
            disabled={busy || backend !== "DURABLE" || !email || password.length < 8}
            onClick={() => submit("sign-in")}
          >
            Sign in
          </button>
        </div>

        <p className="muted footnote" role="status">{message}</p>
      </article>
    </main>
  );
}
