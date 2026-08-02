import { DOCUMENT } from "@angular/common";
import { Injectable, Signal, inject, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class ViewportService {
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly queries = new Map<string, Signal<boolean>>();

  matches(query: string): Signal<boolean> {
    const cached = this.queries.get(query);

    if (cached) {
      return cached;
    }

    const mediaQuery = this.window?.matchMedia(query);
    const state = signal(mediaQuery?.matches ?? false);
    mediaQuery?.addEventListener("change", (event) => state.set(event.matches));

    const matches = state.asReadonly();
    this.queries.set(query, matches);

    return matches;
  }
}
