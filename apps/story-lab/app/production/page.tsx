"use client";

import { useEffect, useState } from "react";

type Job = {
  id: string;
  targetMedia: string;
  stage: string;
  status: string;
};

export default function ProductionPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [durability, setDurability] = useState("UNKNOWN");
  const [message, setMessage] = useState("Loading preview store…");

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
        ? "Durable production store connected."
        : "Preview storage only — jobs may disappear when the serverless instance is recycled."
    );
  }

  useEffect(() => {
    void load();
  }, []);

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
      setMessage("Could not create preview job.");
      return;
    }

    await load();
  }

  return (
    <main className="review-shell">
      <a className="back-link" href="/">← Story Lab</a>
      <div className="eyebrow">T-PIR / PRODUCTION</div>
      <h1>Production Jobs</h1>
      <p className="muted review-intro">
        Preview orchestration for media production. Durable persistence is
        required before production release.
      </p>

      <div className="review-head production-status">
        <span className="status candidate">STORE:{durability}</span>
        <button type="button" onClick={createReferenceJob}>
          Queue Manga reference job
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
            <p>No preview jobs queued.</p>
          </article>
        )}
      </div>
    </main>
  );
}
