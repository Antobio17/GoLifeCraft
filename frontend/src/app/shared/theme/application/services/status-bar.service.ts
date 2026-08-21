import { DOCUMENT } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import { Theme } from "../../domain/models/theme.model";

@Injectable({ providedIn: "root" })
export class StatusBarService {
  private static readonly COLOR_META = "theme-color";
  private static readonly STYLE_META = "apple-mobile-web-app-status-bar-style";
  private static readonly STYLE_TRANSLUCENT = "black-translucent";
  private static readonly STYLE_OPAQUE = "black";
  private static readonly CANVAS_TOKEN = "--ds-status-bar";
  private static readonly SCRIM_TOKEN = "--ds-status-bar-scrim";

  private readonly document = inject(DOCUMENT);
  private readonly scrims = new Set<object>();

  cover(owner: object): void {
    this.scrims.add(owner);
    this.apply();
  }

  uncover(owner: object): void {
    this.scrims.delete(owner);
    this.apply();
  }

  paint(theme: Theme): void {
    this.writeMeta(
      StatusBarService.STYLE_META,
      "dark" === theme
        ? StatusBarService.STYLE_TRANSLUCENT
        : StatusBarService.STYLE_OPAQUE,
    );
    this.apply();
  }

  private apply(): void {
    const token =
      0 === this.scrims.size
        ? StatusBarService.CANVAS_TOKEN
        : StatusBarService.SCRIM_TOKEN;
    const color = this.tokenOf(token);

    if (!color) {
      return;
    }

    this.writeMeta(StatusBarService.COLOR_META, color);
  }

  private tokenOf(name: string): string {
    const view = this.document.defaultView;

    if (!view) {
      return "";
    }

    return view
      .getComputedStyle(this.document.documentElement)
      .getPropertyValue(name)
      .trim();
  }

  private writeMeta(name: string, content: string): void {
    const meta = this.document.querySelector<HTMLMetaElement>(
      `meta[name="${name}"]`,
    );

    if (!meta) {
      return;
    }

    meta.content = content;
  }
}
