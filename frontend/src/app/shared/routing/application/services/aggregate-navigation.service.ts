import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AggregateKind } from "../../domain/models/aggregate-kind.enum";

const ROUTES: Record<AggregateKind, string> = {
  [AggregateKind.Product]: "/catalog",
  [AggregateKind.Recipe]: "/recipes",
};

@Injectable({ providedIn: "root" })
export class AggregateNavigationService {
  private readonly router = inject(Router);

  canOpen(kind: string, refId: string | null | undefined): boolean {
    if (!refId) return false;

    return kind in ROUTES;
  }

  open(kind: string, refId: string | null | undefined): void {
    if (!this.canOpen(kind, refId)) return;

    void this.router.navigate([ROUTES[kind as AggregateKind], refId]);
  }
}
