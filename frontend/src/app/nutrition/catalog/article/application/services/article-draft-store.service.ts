import { Injectable, signal } from "@angular/core";
import { ArticleDraft } from "../../domain/models/article-draft.model";

@Injectable({ providedIn: "root" })
export class ArticleDraftStoreService {
  private readonly draft = signal<ArticleDraft | null>(null);
  private readonly lowConfidenceFields = signal<string[]>([]);

  keep(draft: ArticleDraft, lowConfidenceFields: string[]): void {
    this.draft.set(draft);
    this.lowConfidenceFields.set(lowConfidenceFields);
  }

  take(): { draft: ArticleDraft; lowConfidenceFields: string[] } | null {
    const draft = this.draft();

    if (null === draft) {
      return null;
    }

    const lowConfidenceFields = this.lowConfidenceFields();
    this.clear();

    return { draft, lowConfidenceFields };
  }

  clear(): void {
    this.draft.set(null);
    this.lowConfidenceFields.set([]);
  }
}
