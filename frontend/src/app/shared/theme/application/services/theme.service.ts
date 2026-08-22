import { computed, signal } from "@angular/core";
import {
  DEFAULT_THEME,
  Theme,
  THEME_COLOR_DARK,
  THEME_COLOR_LIGHT,
  THEME_STORAGE_KEY,
} from "../../domain/models/theme.model";
import { UpdateThemePort } from "../../domain/ports/update-theme.port";

export class ThemeService {
  private readonly theme = signal<Theme>(this.loadInitialTheme());

  readonly isDark = computed(() => this.theme() === "dark");

  getCurrentTheme(): Theme {
    return this.theme();
  }

  constructor(private updateThemePort?: UpdateThemePort) {}

  toggle(): void {
    const next: Theme = this.theme() === "light" ? "dark" : "light";
    this.apply(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    this.updateThemePort?.update(next).subscribe();
  }

  applyFromPreference(theme: Theme): void {
    this.apply(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  private apply(theme: Theme): void {
    this.theme.set(theme);
    this.paint(theme);
  }

  private paint(theme: Theme): void {
    document.documentElement.setAttribute("data-theme", theme);
    this.paintThemeColor(theme);
  }

  private paintThemeColor(theme: Theme): void {
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );

    if (!meta) {
      return;
    }

    meta.content = "dark" === theme ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
  }

  private loadInitialTheme(): Theme {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initial = stored ?? DEFAULT_THEME;
    this.paint(initial);
    return initial;
  }
}
