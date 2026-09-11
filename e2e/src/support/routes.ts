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
  { name: "tickets", path: "/tickets", ready: "[data-testid='ticket-card']" },
  { name: "ticket", path: `/tickets/${SEED.tickets.showcase.id}`, ready: "[data-testid='ticket-line']" },
] as const;

export const SPLIT_VIEW_SCREENS = CORE_SCREENS.filter((screen) =>
  ["diary", "shopping", "ticket"].includes(screen.name),
);
