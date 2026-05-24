export type SourceCategory = "TECHNICAL" | "FUNDAMENTAL" | "OPTIONS" | "FLOW" | "NEWS" | "AI";

export interface SourceConfig {
  id: string;
  name: string;
  category: SourceCategory;
  enabled: boolean;
  weight: number;
}

export class SourceConfigRegistry {
  private readonly sources = new Map<string, SourceConfig>();

  upsert(source: SourceConfig): void {
    this.sources.set(source.id, source);
  }

  listEnabled(): SourceConfig[] {
    return [...this.sources.values()].filter((source) => source.enabled);
  }

  listAll(): SourceConfig[] {
    return [...this.sources.values()];
  }
}

export const sourceConfigRegistry = new SourceConfigRegistry();
