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
        icon: "leaf",
        labelKey: "navbar.groupNutrition",
        activeRoutes: [
          "/menus",
          "/recipes",
          "/kitchen",
          "/catalog",
          "/global-catalog",
          "/shopping-list",
          "/tickets",
          "/inventory",
          "/locations",
        ],
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
    ];
  }
}
