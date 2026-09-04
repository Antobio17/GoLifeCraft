import { VisualMode } from "@shared/visual-preference/domain/models/visual-mode.enum";
import { VisualSurface } from "@shared/visual-preference/domain/models/visual-surface.enum";
import { VisualPreferenceService } from "@shared/visual-preference/application/services/visual-preference.service";

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

  it("falls back to images for a surface the server does not know about", () => {
    const service = new VisualPreferenceService();

    service.applyFromPreferences({ [VisualSurface.Shopping]: VisualMode.Icon });

    expect(service.modeOf(VisualSurface.Shopping)).toBe(VisualMode.Icon);
    expect(service.modeOf(VisualSurface.Catalog)).toBe(VisualMode.Image);
  });
});
