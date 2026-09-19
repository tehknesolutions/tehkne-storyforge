"use client";

import { useEffect, useState } from "react";

type AuditItem = {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  from_state: string | null;
  to_state: string | null;
  created_at: string;
};

export default function AuthorityAuditPage() {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [message, setMessage] = useState("Loading authority audit…");

  useEffect(() => {
    void fetch("/api/authority-audit", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          setMessage(data.error ?? "Audit unavailable.");
          return;
        }
        setItems(data.items ?? []);
        setMessage(
          data.items?.length
            ? "Database-generated authority history."
            : "No authority transitions recorded yet."
        );
      })
      .catch(() => setMessage("Could not load authority audit."));
  }, []);

  return (
    <main className="review-shell">
      <a className="back-link" href="/">← Story Lab</a>
      <div className="eyebrow">CREATOR AUTHORITY / AUDIT</div>
      <h1>Authority Audit</h1>
      <p className="muted review-intro">
        Review decisions and Canon commits are appended by database triggers.
        The application has no direct INSERT permission on this log.
      </p>

      <p className="muted">{message}</p>

      <div className="job-list">
        {items.map((item) => (
          <article className="pipeline-card" key={item.id}>
            <span className="step">{item.action}</span>
            <h3>{item.target_type}</h3>
            <p>
              {item.from_state ?? "—"} → {item.to_state ?? "—"}
            </p>
            <code>{item.target_id}</code>
            <p className="muted">{new Date(item.created_at).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
