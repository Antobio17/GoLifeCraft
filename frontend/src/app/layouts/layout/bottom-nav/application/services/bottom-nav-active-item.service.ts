import { Injectable } from "@angular/core";
import { BottomNavItem } from "../../domain/models/bottom-nav-item.model";

@Injectable({ providedIn: "root" })
export class BottomNavActiveItemService {
  findActiveRoute(url: string, items: BottomNavItem[]): string {
    const path = url.split("?")[0].split("#")[0];
    let activeRoute = "";
    let activeLength = 0;

    for (const item of items) {
      const length = this.matchLength(path, item);

      if (length <= activeLength) continue;

      activeRoute = item.route;
      activeLength = length;
    }

    return activeRoute;
  }

  private matchLength(path: string, item: BottomNavItem): number {
    const matches = [item.route, ...item.activeRoutes].filter((route) =>
      this.matches(path, route),
    );

    if (matches.length === 0) return 0;

    return Math.max(...matches.map((route) => route.length));
  }

  private matches(path: string, route: string): boolean {
    return path === route || path.startsWith(`${route}/`);
  }
}
