const proposal = {
  id: "canon-proposal:grandmother-authored-lantern",
  subject: "Memory Lantern",
  predicate: "wasCreatedBy",
  object: "Grandmother",
  rationale:
    "The current canon establishes that Grandmother hid the lantern, not that she created it."
};

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

      <article className="review-card">
        <div className="review-head">
          <span className="status candidate">CANDIDATE</span>
          <code>{proposal.id}</code>
        </div>
        <div className="triple">
          <div><small>SUBJECT</small><strong>{proposal.subject}</strong></div>
          <div><small>PREDICATE</small><strong>{proposal.predicate}</strong></div>
          <div><small>OBJECT</small><strong>{proposal.object}</strong></div>
        </div>
        <p>{proposal.rationale}</p>
        <div className="canon-warning">
          Existing CANON: Memory Lantern → wasHiddenBy → Grandmother
        </div>
        <div className="review-actions">
          <button className="secondary" type="button">Reject</button>
          <button className="secondary" type="button">Edit</button>
          <button type="button">Approve candidate</button>
        </div>
      </article>

      <p className="muted footnote">
        UI foundation only — buttons are intentionally not wired to mutate canon yet.
      </p>
    </main>
  );
}
