import { Signal, WritableSignal, signal } from "@angular/core";
import { EMPTY, Subject, catchError, concatMap } from "rxjs";
import { VisualMode } from "@shared/visual-preference/domain/models/visual-mode.enum";
import { VisualPreferenceChange } from "@shared/visual-preference/domain/models/visual-preference-change.model";
import { VisualPreferences } from "@shared/visual-preference/domain/models/visual-preferences.model";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { UpdateVisualPreferencePort } from "@shared/visual-preference/domain/ports/update-visual-preference.port";

const STORAGE_KEY = "app-visual-preferences";

export class VisualPreferenceService {
  private readonly preferences: WritableSignal<VisualPreferences> = signal(
    this.loadInitialPreferences(),
  );

  private readonly pendingChanges = new Subject<VisualPreferenceChange>();

  readonly all: Signal<VisualPreferences> = this.preferences.asReadonly();

  constructor(updateVisualPreferencePort?: UpdateVisualPreferencePort) {
    if (!updateVisualPreferencePort) return;

    this.pendingChanges
      .pipe(
        concatMap((change) =>
          updateVisualPreferencePort
            .update(change.surfaces, change.mode)
            .pipe(catchError(() => EMPTY)),
        ),
      )
      .subscribe();
  }

  modeOf(surface: VisualSurface): VisualMode {
    return this.preferences()[surface];
  }

  showsImages(surface: VisualSurface): boolean {
    return VisualMode.Image === this.modeOf(surface);
  }

  change(surface: VisualSurface, mode: VisualMode): void {
    this.changeMany([surface], mode);
  }

  changeAll(mode: VisualMode): void {
    this.changeMany(Object.values(VisualSurface), mode);
  }

  changeMany(surfaces: VisualSurface[], mode: VisualMode): void {
    const current = this.preferences();
    const pending = surfaces.filter((surface) => current[surface] !== mode);

    if (0 === pending.length) return;

    this.store(
      pending.reduce((all, surface) => ({ ...all, [surface]: mode }), current),
    );

    this.pendingChanges.next({ surfaces: pending, mode });
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
