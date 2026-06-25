import { computed, signal } from "@angular/core";
import {
  DEFAULT_THEME,
  Theme,
  THEME_STORAGE_KEY,
} from "../../domain/models/theme.model";
import { UpdateThemePort } from "../../domain/ports/update-theme.port";

export class ThemeService {
  private readonly theme = signal<Theme>(this.loadInitialTheme());

  readonly isDark = computed(() => this.theme() === "dark");

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
    document.documentElement.setAttribute("data-theme", theme);

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#1e293b" : "#ffffff",
      );
    }
  }

  private loadInitialTheme(): Theme {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initial = stored ?? DEFAULT_THEME;
    document.documentElement.setAttribute("data-theme", initial);
    return initial;
  }
}
