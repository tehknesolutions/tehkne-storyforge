import type { MediaTarget } from "../tnir/types.js";
import type { ProviderDescriptor } from "./provider-registry.js";

export interface ProviderSelection {
  provider: ProviderDescriptor | null;
  rejected: Array<{
    providerId: string;
    reasons: string[];
  }>;
}

export function selectProvider(input: {
  providers: ProviderDescriptor[];
  targetMedia: MediaTarget;
  env: Record<string, string | undefined>;
  preferredProviderIds?: string[];
}): ProviderSelection {
  const preferred = input.preferredProviderIds ?? [];
  const ordered = [...input.providers].sort((a, b) => {
    const ai = preferred.indexOf(a.id);
    const bi = preferred.indexOf(b.id);
    const ar = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const br = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    return ar - br;
  });

  const rejected: ProviderSelection["rejected"] = [];

  for (const provider of ordered) {
    const reasons: string[] = [];

    if (!provider.enabled) reasons.push("PROVIDER_DISABLED");
    if (!provider.capabilities.includes(input.targetMedia)) {
      reasons.push("MEDIA_NOT_SUPPORTED");
    }

    const missing = provider.requiresEnvironment.filter((key) => !input.env[key]);
    for (const key of missing) reasons.push(`MISSING_ENV:${key}`);

    if (!reasons.length) {
      return { provider, rejected };
    }

    rejected.push({
      providerId: provider.id,
      reasons
    });
  }

  return {
    provider: null,
    rejected
  };
}
