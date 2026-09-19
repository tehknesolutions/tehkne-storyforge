import type { MediaTarget } from "../tnir/types.js";
import type { ModelAdapter } from "./model-adapter.js";

export type ProviderKind = "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "MULTIMODAL";

export interface ProviderDescriptor {
  id: string;
  displayName: string;
  kind: ProviderKind;
  adapterId: string;
  capabilities: MediaTarget[];
  requiresEnvironment: string[];
  enabled: boolean;
  metadata?: Record<string, unknown>;
}

export class ProviderRegistry {
  #providers = new Map<string, ProviderDescriptor>();
  #adapters = new Map<string, ModelAdapter>();

  registerProvider(provider: ProviderDescriptor): void {
    if (this.#providers.has(provider.id)) {
      throw new Error(`Provider already registered: ${provider.id}`);
    }
    this.#providers.set(provider.id, provider);
  }

  registerAdapter(adapter: ModelAdapter): void {
    if (this.#adapters.has(adapter.id)) {
      throw new Error(`Adapter already registered: ${adapter.id}`);
    }
    this.#adapters.set(adapter.id, adapter);
  }

  provider(id: string): ProviderDescriptor | undefined {
    return this.#providers.get(id);
  }

  adapter(id: string): ModelAdapter | undefined {
    return this.#adapters.get(id);
  }

  enabledFor(targetMedia: MediaTarget): ProviderDescriptor[] {
    return [...this.#providers.values()].filter(
      (provider) => provider.enabled && provider.capabilities.includes(targetMedia)
    );
  }

  validateEnvironment(
    providerId: string,
    env: Record<string, string | undefined>
  ): string[] {
    const provider = this.#providers.get(providerId);
    if (!provider) return [`Unknown provider: ${providerId}`];

    return provider.requiresEnvironment.filter((key) => !env[key]);
  }
}
