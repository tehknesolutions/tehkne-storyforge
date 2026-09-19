"use client";

import { useEffect, useState } from "react";
import { useI18n } from "../i18n";

type ProviderStatus = {
  configured?: boolean;
  enabled?: boolean;
  model?: string;
  authority?: string;
  storeResponses?: boolean;
};

export default function GeneratePage() {
  const { locale, t } = useI18n();
  const [status, setStatus] = useState<ProviderStatus>({});
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    setResult(t("generate.loading"));
    void fetch("/api/provider-status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        setStatus(data);
        setResult(
          data.enabled
            ? t("generate.ready")
            : data.configured
              ? t("generate.enableLocked")
              : t("generate.keyMissing")
        );
      })
      .catch(() => setResult(t("generate.statusError")));
  }, [t]);

  async function generate() {
    setBusy(true);
    setResult(t("generate.generating"));

    try {
      const response = await fetch("/api/generate/reference", {
        method: "POST",
        headers: {
          "x-storyforge-generation-token": accessToken,
          "x-storyforge-locale": locale
        }
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="review-shell">
      <a className="back-link" href="/">{t("common.back")}</a>
      <div className="eyebrow">{t("generate.eyebrow")}</div>
      <h1>{t("generate.title")}</h1>
      <p className="muted review-intro">{t("generate.body")}</p>

      <article className="review-card">
        <div className="review-head">
          <span className={`status ${status.configured ? "canon" : "candidate"}`}>
            {status.configured ? t("common.configured") : t("common.locked")}
          </span>
          <code>{status.model ?? "model:unknown"}</code>
        </div>

        <p>
          {t("generate.authority")}:{" "}
          <strong>{status.authority ?? "CANDIDATE_ONLY"}</strong>
        </p>
        <p>
          {t("generate.storage")}:{" "}
          <strong>{status.storeResponses === false ? t("common.off") : t("common.unknown")}</strong>
        </p>

        <label className="provider-token-field">
          <span>{t("generate.token")}</span>
          <input
            type="password"
            value={accessToken}
            onChange={(event) => setAccessToken(event.target.value)}
            autoComplete="off"
            placeholder={t("generate.tokenPlaceholder")}
          />
        </label>

        <button
          type="button"
          disabled={!status.enabled || busy || !accessToken}
          onClick={generate}
        >
          {busy ? t("generate.buttonBusy") : t("generate.button")}
        </button>
      </article>

      <pre className="provider-output">{result}</pre>
    </main>
  );
}
