"use client";

import { useEffect, useState } from "react";

type ProviderStatus = {
  configured?: boolean;
  enabled?: boolean;
  model?: string;
  authority?: string;
  storeResponses?: boolean;
};

export default function GeneratePage() {
  const [status, setStatus] = useState<ProviderStatus>({});
  const [result, setResult] = useState(
    "Provider status is loading…"
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch("/api/provider-status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        setStatus(data);
        setResult(
          data.enabled
            ? "Provider configured and explicitly enabled. Reference generation is available."
            : data.configured
              ? "Provider configured but execution is locked until STORYFORGE_GENERATION_ENABLED=true."
              : "Provider locked: OPENAI_API_KEY is not configured."
        );
      })
      .catch(() => setResult("Could not read provider status."));
  }, []);

  async function generate() {
    setBusy(true);
    setResult("Generating reference panel…");

    try {
      const response = await fetch("/api/generate/reference", {
        method: "POST"
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="review-shell">
      <a className="back-link" href="/">← Story Lab</a>
      <div className="eyebrow">PROVIDER EXECUTION</div>
      <h1>Reference Generation</h1>
      <p className="muted review-intro">
        Executes one server-authorized Manga reference unit. Provider output
        remains outside canon and passes through assertion classification.
      </p>

      <article className="review-card">
        <div className="review-head">
          <span className={`status ${status.configured ? "canon" : "candidate"}`}>
            {status.configured ? "CONFIGURED" : "LOCKED"}
          </span>
          <code>{status.model ?? "model:unknown"}</code>
        </div>

        <p>
          Authority: <strong>{status.authority ?? "CANDIDATE_ONLY"}</strong>
        </p>
        <p>
          Provider response storage:{" "}
          <strong>{status.storeResponses === false ? "OFF" : "UNKNOWN"}</strong>
        </p>

        <button
          type="button"
          disabled={!status.enabled || busy}
          onClick={generate}
        >
          {busy ? "Generating…" : "Generate reference Manga panel"}
        </button>
      </article>

      <pre className="provider-output">{result}</pre>
    </main>
  );
}
