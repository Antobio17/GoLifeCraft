import { Observable, of } from "rxjs";
import { VisualMode } from "@shared/visual-preference/domain/models/visual-mode.enum";
import { VisualPreferenceChange } from "@shared/visual-preference/domain/models/visual-preference-change.model";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { UpdateVisualPreferencePort } from "@shared/visual-preference/domain/ports/update-visual-preference.port";
import { VisualPreferenceService } from "@shared/visual-preference/application/services/visual-preference.service";

class RecordingUpdateVisualPreferencePort extends UpdateVisualPreferencePort {
  readonly calls: VisualPreferenceChange[] = [];

  update(surfaces: VisualSurface[], mode: VisualMode): Observable<void> {
    this.calls.push({ surfaces, mode });

    return of(undefined);
  }
}

describe("VisualPreferenceService", () => {
  beforeEach(() => localStorage.clear());

  it("shows images on every surface by default", () => {
    const service = new VisualPreferenceService();

    Object.values(VisualSurface).forEach((surface) =>
      expect(service.showsImages(surface)).toBeTrue(),
    );
  });

  it("toggles one surface and leaves the rest on images", () => {
    const service = new VisualPreferenceService();

    service.toggle(VisualSurface.Diary);

    expect(service.modeOf(VisualSurface.Diary)).toBe(VisualMode.Icon);
    expect(service.modeOf(VisualSurface.Menu)).toBe(VisualMode.Image);
  });

  it("reads back what a previous session stored", () => {
    new VisualPreferenceService().change(
      VisualSurface.Kitchen,
      VisualMode.Icon,
    );

    expect(new VisualPreferenceService().modeOf(VisualSurface.Kitchen)).toBe(
      VisualMode.Icon,
    );
  });

  it("sends a single request when every surface changes at once", () => {
    const port = new RecordingUpdateVisualPreferencePort();
    const service = new VisualPreferenceService(port);

    service.changeAll(VisualMode.Icon);

    expect(port.calls.length).toBe(1);
    expect(port.calls[0].surfaces).toEqual(Object.values(VisualSurface));
    expect(port.calls[0].mode).toBe(VisualMode.Icon);
  });

  it("sends no request when every surface already uses the chosen mode", () => {
    const port = new RecordingUpdateVisualPreferencePort();
    const service = new VisualPreferenceService(port);

    service.changeAll(VisualMode.Image);

    expect(port.calls.length).toBe(0);
  });

  it("sends only the surfaces that actually change", () => {
    const port = new RecordingUpdateVisualPreferencePort();
    const service = new VisualPreferenceService(port);

    service.change(VisualSurface.Diary, VisualMode.Icon);
    service.changeAll(VisualMode.Icon);

    expect(port.calls[0].surfaces).toEqual([VisualSurface.Diary]);
    expect(port.calls[1].surfaces).not.toContain(VisualSurface.Diary);
  });

  it("falls back to images for a surface the server does not know about", () => {
    const service = new VisualPreferenceService();

    service.applyFromPreferences({ [VisualSurface.Shopping]: VisualMode.Icon });

    expect(service.modeOf(VisualSurface.Shopping)).toBe(VisualMode.Icon);
    expect(service.modeOf(VisualSurface.Catalog)).toBe(VisualMode.Image);
  });
});
