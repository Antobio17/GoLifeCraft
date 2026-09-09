/**
 * Las pantallas del núcleo, en un único sitio. La regresión visual, los guards
 * de layout y la pasada de accesibilidad recorren esta misma lista: así una
 * pantalla nueva entra en las tres capas a la vez y no se queda a medio cubrir.
 *
 * `ready` es el elemento que prueba que la pantalla terminó de pintar. No vale
 * con esperar al `ds-page-wrapper`: existe desde el primer frame, también
 * mientras se ven los skeletons.
 */
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
] as const;

/** Pantallas con `ds-split-view`, las únicas donde aplica el guard de columnas. */
export const SPLIT_VIEW_SCREENS = CORE_SCREENS.filter((screen) =>
  ["diary", "shopping"].includes(screen.name),
);
