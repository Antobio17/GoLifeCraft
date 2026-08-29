import { Injectable } from "@angular/core";
import { BottomNavItem } from "../../domain/models/bottom-nav-item.model";

@Injectable({ providedIn: "root" })
export class BottomNavItemsService {
  getItems(): BottomNavItem[] {
    return [
      {
        route: "/dashboard",
        icon: "home",
        labelKey: "navbar.home",
        activeRoutes: [],
      },
      {
        route: "/diary",
        icon: "diary",
        labelKey: "navbar.diary",
        activeRoutes: [],
      },
      {
        route: "/gym",
        icon: "dumbbell",
        labelKey: "navbar.gym",
        activeRoutes: [],
      },
      {
        route: "/economy",
        icon: "wallet",
        labelKey: "navbar.economy",
        activeRoutes: [],
      },
      {
        route: "/menus",
        icon: "menuboard",
        labelKey: "navbar.menus",
        activeRoutes: [],
      },
      {
        route: "/catalog",
        icon: "leaf",
        labelKey: "navbar.catalog",
        activeRoutes: ["/global-catalog"],
      },
      {
        route: "/recipes",
        icon: "chefHat",
        labelKey: "navbar.recipes",
        activeRoutes: [],
      },
      {
        route: "/shopping-list",
        icon: "cart",
        labelKey: "navbar.list",
        activeRoutes: [],
      },
      {
        route: "/agenda",
        icon: "agenda",
        labelKey: "navbar.agenda",
        activeRoutes: [],
      },
    ];
  }
}
