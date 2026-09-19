import { ReviewCard } from "./review-card";

export default function ReviewPage() {
  return (
    <main className="review-shell">
      <a className="back-link" href="/">← Story Lab</a>
      <div className="eyebrow">CREATOR AUTHORITY</div>
      <h1>Canon Review</h1>
      <p className="muted review-intro">
        Generated assertions never cross into canon automatically. Review,
        edit, approve or reject each candidate.
      </p>

      <ReviewCard />

      <p className="muted footnote">
        Preview review state is ephemeral. Canon mutation is disabled.
      </p>
    </main>
  );
}
