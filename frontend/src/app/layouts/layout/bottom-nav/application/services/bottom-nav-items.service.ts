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
        exact: false,
      },
      {
        route: "/diary",
        icon: "diary",
        labelKey: "navbar.diary",
        exact: false,
      },
      {
        route: "/gym",
        icon: "dumbbell",
        labelKey: "navbar.gym",
        exact: false,
      },
      {
        route: "/menus",
        icon: "menuboard",
        labelKey: "navbar.menus",
        exact: false,
      },
      {
        route: "/catalog",
        icon: "leaf",
        labelKey: "navbar.catalog",
        exact: true,
      },
      {
        route: "/recipes",
        icon: "chefHat",
        labelKey: "navbar.recipes",
        exact: false,
      },
      {
        route: "/shopping-list",
        icon: "cart",
        labelKey: "navbar.list",
        exact: false,
      },
      {
        route: "/agenda",
        icon: "agenda",
        labelKey: "navbar.agenda",
        exact: false,
      },
    ];
  }
}
