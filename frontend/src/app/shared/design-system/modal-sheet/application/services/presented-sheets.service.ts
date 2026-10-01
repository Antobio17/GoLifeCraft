import { Injectable, computed, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class PresentedSheetsService {
  private readonly owners = signal<ReadonlySet<object>>(new Set());

  readonly any = computed(() => this.owners().size > 0);

  present(owner: object): void {
    this.owners.update((owners) => new Set(owners).add(owner));
  }

  dismiss(owner: object): void {
    this.owners.update((owners) => {
      const next = new Set(owners);
      next.delete(owner);
      return next;
    });
  }
}
