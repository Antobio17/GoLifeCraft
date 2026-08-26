import { DOCUMENT } from "@angular/common";
import { Injectable, inject } from "@angular/core";

@Injectable({ providedIn: "root" })
export class StatusBarTintService {
  private static readonly SCRIM_ALPHA = 0.5;
  private static readonly BASE_COLOR_VARIABLE = "--ds-bg";
  private static readonly TINT_VARIABLE = "--ds-status-bar-tint";

  private readonly document = inject(DOCUMENT);
  private readonly owners = new Set<object>();

  tint(owner: object): void {
    this.owners.add(owner);
    this.apply();
  }

  release(owner: object): void {
    this.owners.delete(owner);
    this.apply();
  }

  private apply(): void {
    const root = this.document.documentElement;
    const base = this.readBaseColor(root);

    if (0 === this.owners.size) {
      root.style.removeProperty("background-color");
      root.style.removeProperty(StatusBarTintService.TINT_VARIABLE);
      this.paintThemeColor(base);

      return;
    }

    const scrimmed = this.scrim(base);
    root.style.setProperty("background-color", scrimmed);
    root.style.setProperty(StatusBarTintService.TINT_VARIABLE, "transparent");
    this.paintThemeColor(scrimmed);
  }

  private readBaseColor(root: HTMLElement): string {
    const inlineBackground = root.style.backgroundColor;
    root.style.removeProperty("background-color");

    const base = getComputedStyle(root)
      .getPropertyValue(StatusBarTintService.BASE_COLOR_VARIABLE)
      .trim();

    if (inlineBackground) {
      root.style.setProperty("background-color", inlineBackground);
    }

    return base;
  }

  private scrim(color: string): string {
    const channels = this.toChannels(color);

    if (!channels) {
      return color;
    }

    const dimmed = channels.map((channel) =>
      Math.round(channel * (1 - StatusBarTintService.SCRIM_ALPHA)),
    );

    return `rgb(${dimmed[0]}, ${dimmed[1]}, ${dimmed[2]})`;
  }

  private toChannels(color: string): number[] | null {
    const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);

    if (hex) {
      const digits =
        3 === hex[1].length
          ? hex[1]
              .split("")
              .map((digit) => digit + digit)
              .join("")
          : hex[1];

      return [0, 2, 4].map((offset) =>
        parseInt(digits.slice(offset, offset + 2), 16),
      );
    }

    const rgb = color.match(/(\d+(?:\.\d+)?)/g);

    if (rgb && 3 <= rgb.length) {
      return rgb.slice(0, 3).map((channel) => Number(channel));
    }

    return null;
  }

  private paintThemeColor(color: string): void {
    const meta = this.document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );

    if (!meta) {
      return;
    }

    meta.content = color;
  }
}
