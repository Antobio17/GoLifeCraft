import { SEED } from "./seed-data";

export interface CoreScreen {
  readonly name: string;
  readonly path: string;
  readonly ready: string;
}

export const CORE_SCREENS: readonly CoreScreen[] = [
  { name: "dashboard", path: "/dashboard", ready: "[data-testid='dashboard-greeting']" },
  { name: "catalog", path: "/catalog", ready: "[data-testid='article-card']" },
  { name: "recipes", path: "/recipes", ready: "[data-testid='recipe-card']" },
  { name: "diary", path: "/diary", ready: "[data-testid='diary-summary']" },
  { name: "shopping", path: "/shopping-list", ready: "ds-page-wrapper ds-heading" },
  { name: "tickets", path: "/tickets", ready: "[data-testid='ticket-row']" },
  { name: "ticket", path: `/tickets/${SEED.tickets.showcase.id}`, ready: "[data-testid='ticket-line']" },
  { name: "scan-ticket", path: "/tickets/scan", ready: "[data-testid='scan-ticket-analyze']" },
  { name: "kitchen", path: "/kitchen", ready: "[data-testid='kitchen-lot-row']" },
  { name: "inventory", path: "/inventory", ready: "[data-testid='inventory-row']" },
  { name: "menus", path: "/menus", ready: "[data-testid='menu-card']" },
  { name: "locations", path: "/locations", ready: "[data-testid='location-card']" },
  { name: "notifications", path: "/notifications", ready: "[data-testid='notifications-empty']" },
  {
    name: "notification-settings",
    path: "/notifications?tab=settings",
    ready: "[data-testid='notifications-quiet-toggle']",
  },
  {
    name: "notification-module-settings",
    path: "/notifications/settings/nutrition",
    ready: "[data-testid='notifications-preference-lunch']",
  },
] as const;

export const SPLIT_VIEW_SCREENS = CORE_SCREENS.filter((screen) =>
  [
    "diary",
    "shopping",
    "ticket",
    "kitchen",
    "inventory",
    "notification-settings",
  ].includes(screen.name),
);
