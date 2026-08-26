import { Injectable } from "@angular/core";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";
import { DrawerNavItem } from "../../domain/models/drawer-nav-item.model";
import { DrawerNavSection } from "../../domain/models/drawer-nav-section.model";

@Injectable({ providedIn: "root" })
export class DrawerNavSectionsService {
  private readonly grafanaUrl = "/grafana/";

  getSections(isGod: boolean): DrawerNavSection[] {
    const sections: DrawerNavSection[] = [
      {
        labelKey: "navbar.groupGeneral",
        items: [
          this.route("home", "navbar.home", "/dashboard"),
          this.route("agenda", "navbar.agenda", "/agenda"),
        ],
      },
      {
        labelKey: "navbar.groupNutrition",
        items: [
          this.route("diary", "navbar.diary", "/diary"),
          this.route("menuboard", "navbar.menus", "/menus"),
          this.route("chefHat", "navbar.recipes", "/recipes"),
          this.route("cart", "navbar.list", "/shopping-list"),
          this.route("leaf", "navbar.catalog", "/catalog"),
          this.route("download", "navbar.import", "/global-catalog", {
            sub: true,
          }),
        ],
      },
      {
        labelKey: "navbar.groupFitness",
        items: [
          this.route("dumbbell", "navbar.gym", "/gym/sessions"),
          this.route("dumbbell", "navbar.exercises", "/gym/exercises", {
            sub: true,
          }),
          this.route("history", "navbar.history", "/gym/history", {
            sub: true,
          }),
        ],
      },
      {
        labelKey: "navbar.groupFinance",
        items: [
          this.route("wallet", "navbar.economy", "/economy", { exact: true }),
          this.route("chart", "navbar.budget", "/economy/budget", {
            sub: true,
          }),
          this.route("wallet", "navbar.accounts", "/economy/accounts", {
            sub: true,
          }),
          this.route("repeat", "navbar.recurrences", "/economy/recurrences", {
            sub: true,
          }),
        ],
      },
    ];

    if (!isGod) {
      return sections;
    }

    return [
      ...sections,
      {
        labelKey: "navbar.groupAdmin",
        items: [
          this.route("users", "navbar.users", "/users", { badge: "ADMIN" }),
          this.link("chart", "navbar.logs", this.grafanaUrl, "ADMIN"),
        ],
      },
    ];
  }

  private route(
    icon: DsIconName,
    labelKey: string,
    route: string,
    options: { exact?: boolean; sub?: boolean; badge?: string } = {},
  ): DrawerNavItem {
    return {
      icon,
      labelKey,
      route,
      href: "",
      activeOptions: { exact: options.exact === true },
      sub: options.sub === true,
      badge: options.badge ?? "",
    };
  }

  private link(
    icon: DsIconName,
    labelKey: string,
    href: string,
    badge: string,
  ): DrawerNavItem {
    return {
      icon,
      labelKey,
      route: "",
      href,
      activeOptions: { exact: false },
      sub: false,
      badge,
    };
  }
}
