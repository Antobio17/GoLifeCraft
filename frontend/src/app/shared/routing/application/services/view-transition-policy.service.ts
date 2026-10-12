import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";

@Injectable({ providedIn: "root" })
export class ViewTransitionPolicyService {
  crossesSection(
    from: ActivatedRouteSnapshot,
    to: ActivatedRouteSnapshot,
  ): boolean {
    return this.sectionOf(from) !== this.sectionOf(to);
  }

  private sectionOf(root: ActivatedRouteSnapshot): string {
    const segments = this.leafOf(root).pathFromRoot.flatMap(
      (route) => route.url,
    );

    return segments[0]?.path ?? "";
  }

  private leafOf(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    if (null === route.firstChild) return route;

    return this.leafOf(route.firstChild);
  }
}
