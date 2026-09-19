"use client";

import type { NarrativeForgeV03 } from "@/lib/storyforge-v03";
import { useI18n } from "./i18n";

type Props = {
  forge: NarrativeForgeV03;
};

export function NarrativeForgeView({ forge }: Props) {
  const { t } = useI18n();

  return (
    <div className="workspace-step">
      <div className="workspace-step-label">
        07 · {t("forge.claimLedger")}
      </div>
      <p className="muted forge-intro">{t("forge.claimLedgerBody")}</p>

      <div className="claim-ledger">
        {forge.claims.map((claim) => (
          <article key={claim.id}>
            <div className="review-head">
              <code>{claim.id}</code>
              <span
                className={`status ${
                  claim.authority === "IDEA" ? "canon" : "candidate"
                }`}
              >
                {claim.authority}
              </span>
            </div>
            <p>{claim.text}</p>
            <small>{claim.rationale}</small>
          </article>
        ))}
      </div>
    </div>
  );
}
