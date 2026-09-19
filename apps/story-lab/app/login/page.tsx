"use client";

import { useEffect, useState } from "react";
import { useI18n } from "../i18n";

export default function LoginPage() {
  const { t } = useI18n();
  const [backend, setBackend] = useState<"UNKNOWN" | "EPHEMERAL" | "DURABLE">(
    "UNKNOWN"
  );
  const [signupEnabled, setSignupEnabled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMessage(t("login.checking"));
    void fetch("/api/auth/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        setBackend(data.backend ?? "EPHEMERAL");
        setSignupEnabled(Boolean(data.signupEnabled));
        setMessage(
          data.backend === "DURABLE"
            ? data.authenticated
              ? t("login.sessionActive")
              : t("login.durableAvailable")
            : t("login.previewMode")
        );
      })
      .catch(() => setMessage(t("login.statusError")));
  }, [t]);

  async function submit(mode: "sign-in" | "sign-up") {
    setBusy(true);
    setMessage(mode === "sign-in" ? t("login.signingIn") : t("login.creating"));

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message ?? t("login.failed"));
        return;
      }

      if (mode === "sign-in") {
        window.location.href = "/production";
        return;
      }

      setMessage(
        data.sessionCreated
          ? t("login.createdSession")
          : t("login.createdConfirm")
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="review-shell">
      <a className="back-link" href="/">{t("common.back")}</a>
      <div className="eyebrow">{t("login.eyebrow")}</div>
      <h1>{t("login.title")}</h1>
      <p className="muted review-intro">{t("login.body")}</p>

      <article className="review-card auth-card">
        <span className={`status ${backend === "DURABLE" ? "canon" : "candidate"}`}>
          BACKEND:{backend}
        </span>

        <label className="provider-token-field">
          <span>{t("login.email")}</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="provider-token-field">
          <span>{t("login.password")}</span>
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
              {t("login.create")}
            </button>
          ) : null}

          <button
            type="button"
            disabled={busy || backend !== "DURABLE" || !email || password.length < 8}
            onClick={() => submit("sign-in")}
          >
            {t("login.signIn")}
          </button>
        </div>

        <p className="muted footnote" role="status">{message}</p>
      </article>
    </main>
  );
}
