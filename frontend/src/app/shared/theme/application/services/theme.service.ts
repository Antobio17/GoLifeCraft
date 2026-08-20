import { computed, inject, signal } from "@angular/core";
import {
  DEFAULT_THEME,
  Theme,
  THEME_STORAGE_KEY,
} from "../../domain/models/theme.model";
import { UpdateThemePort } from "../../domain/ports/update-theme.port";
import { StatusBarService } from "./status-bar.service";

export class ThemeService {
  private readonly statusBar = inject(StatusBarService);

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
    this.statusBar.paint(theme);
  }

  private loadInitialTheme(): Theme {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initial = stored ?? DEFAULT_THEME;
    this.paint(initial);
    return initial;
  }
}
