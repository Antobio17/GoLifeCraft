import { Signal, WritableSignal, signal } from "@angular/core";
import { VisualMode } from "@shared/visual-preference/domain/models/visual-mode.enum";
import { VisualPreferences } from "@shared/visual-preference/domain/models/visual-preferences.model";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { UpdateVisualPreferencePort } from "@shared/visual-preference/domain/ports/update-visual-preference.port";

const STORAGE_KEY = "app-visual-preferences";

export class VisualPreferenceService {
  private readonly preferences: WritableSignal<VisualPreferences> = signal(
    this.loadInitialPreferences(),
  );

  readonly all: Signal<VisualPreferences> = this.preferences.asReadonly();

  constructor(
    private updateVisualPreferencePort?: UpdateVisualPreferencePort,
  ) {}

  modeOf(surface: VisualSurface): VisualMode {
    return this.preferences()[surface];
  }

  showsImages(surface: VisualSurface): boolean {
    return VisualMode.Image === this.modeOf(surface);
  }

  change(surface: VisualSurface, mode: VisualMode): void {
    this.store({ ...this.preferences(), [surface]: mode });
    this.updateVisualPreferencePort?.update(surface, mode).subscribe();
  }

  toggle(surface: VisualSurface): void {
    this.change(
      surface,
      this.showsImages(surface) ? VisualMode.Icon : VisualMode.Image,
    );
  }

  applyFromPreferences(preferences: Partial<VisualPreferences>): void {
    this.store(VisualPreferenceService.normalize(preferences));
  }

  private store(preferences: VisualPreferences): void {
    this.preferences.set(preferences);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      return;
    }
  }

  private loadInitialPreferences(): VisualPreferences {
    return VisualPreferenceService.normalize(this.readStoredPreferences());
  }

  private readStoredPreferences(): Partial<VisualPreferences> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      return null === raw
        ? {}
        : (JSON.parse(raw) as Partial<VisualPreferences>);
    } catch {
      return {};
    }
  }

  private static normalize(
    preferences: Partial<VisualPreferences> | null,
  ): VisualPreferences {
    const stored = preferences ?? {};

    return Object.values(VisualSurface).reduce((all, surface) => {
      all[surface] =
        VisualMode.Icon === stored[surface]
          ? VisualMode.Icon
          : VisualMode.Image;

      return all;
    }, {} as VisualPreferences);
  }
}
