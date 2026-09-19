"use client";

import { useEffect, useState } from "react";
import { useI18n } from "../i18n";

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
  const { locale, t } = useI18n();
  const [items, setItems] = useState<AuditItem[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage(t("audit.loading"));
    void fetch("/api/authority-audit", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          setMessage(data.error ?? t("audit.unavailable"));
          return;
        }
        setItems(data.items ?? []);
        setMessage(data.items?.length ? t("audit.loaded") : t("audit.empty"));
      })
      .catch(() => setMessage(t("audit.error")));
  }, [t]);

  return (
    <main className="review-shell">
      <a className="back-link" href="/">{t("common.back")}</a>
      <div className="eyebrow">{t("audit.eyebrow")}</div>
      <h1>{t("audit.title")}</h1>
      <p className="muted review-intro">{t("audit.body")}</p>

      <p className="muted">{message}</p>

      <div className="job-list">
        {items.map((item) => (
          <article className="pipeline-card" key={item.id}>
            <span className="step">{item.action}</span>
            <h3>{item.target_type}</h3>
            <p>{item.from_state ?? "—"} → {item.to_state ?? "—"}</p>
            <code>{item.target_id}</code>
            <p className="muted">
              {new Date(item.created_at).toLocaleString(locale)}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
