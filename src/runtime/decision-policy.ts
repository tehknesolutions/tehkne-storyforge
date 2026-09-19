export interface DecisionWeights {
  goalAlignment: number;
  beliefSupport: number;
  valueAlignment: number;
  feasibility: number;
  risk: number;
  relationshipImpact: number;
  dramaticPressure: number;
}

export const DEFAULT_DECISION_WEIGHTS: DecisionWeights = {
  goalAlignment: 0.30,
  beliefSupport: 0.15,
  valueAlignment: 0.15,
  feasibility: 0.15,
  risk: -0.15,
  relationshipImpact: 0.05,
  dramaticPressure: 0.05
};

export interface DecisionMetrics {
  goalAlignment: number;
  beliefSupport: number;
  valueAlignment: number;
  feasibility: number;
  risk: number;
  relationshipImpact: number;
  dramaticPressure: number;
}

export function scoreDecision(
  metrics: DecisionMetrics,
  weights: DecisionWeights = DEFAULT_DECISION_WEIGHTS
): number {
  const total =
    metrics.goalAlignment * weights.goalAlignment +
    metrics.beliefSupport * weights.beliefSupport +
    metrics.valueAlignment * weights.valueAlignment +
    metrics.feasibility * weights.feasibility +
    metrics.risk * weights.risk +
    metrics.relationshipImpact * weights.relationshipImpact +
    metrics.dramaticPressure * weights.dramaticPressure;

  return Number(Math.max(-1, Math.min(1, total)).toFixed(4));
}
