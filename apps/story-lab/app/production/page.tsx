"use client";

import { useEffect, useState } from "react";
import { useI18n } from "../i18n";

type Job = {
  id: string;
  targetMedia: string;
  stage: string;
  status: string;
};

export default function ProductionPage() {
  const { t } = useI18n();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [durability, setDurability] = useState("UNKNOWN");
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/production/jobs", { cache: "no-store" });
    const data = (await response.json()) as {
      durability?: string;
      productionSafe?: boolean;
      jobs?: Job[];
    };

    setJobs(data.jobs ?? []);
    setDurability(data.durability ?? "UNKNOWN");
    setMessage(
      data.productionSafe
        ? t("production.durable")
        : t("production.preview")
    );
  }

  useEffect(() => {
    setMessage(t("production.loading"));
    void load();
  }, [t]);

  async function createReferenceJob() {
    const id = `production-job:manga:${Date.now()}`;
    const response = await fetch("/api/production/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        targetMedia: "MANGA",
        stage: "BRIEF",
        status: "QUEUED",
        source: {
          universeId: "universe:lantern-below",
          universeVersion: "0.5.0",
          storyId: "story:first-light",
          realizationProfileId: "realization:manga-descend"
        }
      })
    });

    if (!response.ok) {
      setMessage(t("production.createError"));
      return;
    }

    await load();
  }

  return (
    <main className="review-shell">
      <a className="back-link" href="/">{t("common.back")}</a>
      <div className="eyebrow">{t("production.eyebrow")}</div>
      <h1>{t("production.title")}</h1>
      <p className="muted review-intro">{t("production.body")}</p>

      <div className="review-head production-status">
        <span className="status candidate">{t("production.store")}:{durability}</span>
        <button type="button" onClick={createReferenceJob}>
          {t("production.queue")}
        </button>
      </div>

      <p className="muted">{message}</p>

      <div className="job-list">
        {jobs.length ? jobs.map((job) => (
          <article className="pipeline-card" key={job.id}>
            <span className="step">{job.status}</span>
            <h3>{job.targetMedia}</h3>
            <p>{job.stage}</p>
            <code>{job.id}</code>
          </article>
        )) : (
          <article className="review-card">
            <p>{t("production.empty")}</p>
          </article>
        )}
      </div>
    </main>
  );
}
