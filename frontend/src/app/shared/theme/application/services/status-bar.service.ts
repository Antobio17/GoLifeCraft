import { DOCUMENT } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import {
  Theme,
  THEME_COLOR_DARK,
  THEME_COLOR_LIGHT,
} from "../../domain/models/theme.model";

@Injectable({ providedIn: "root" })
export class StatusBarService {
  private static readonly HEX_COLOR = /^#[0-9a-f]{6}$/i;
  private static readonly COLOR_META = "theme-color";
  private static readonly STYLE_META = "apple-mobile-web-app-status-bar-style";
  private static readonly STYLE_TRANSLUCENT = "black-translucent";
  private static readonly STYLE_OPAQUE = "black";

  private readonly document = inject(DOCUMENT);

  private pendingFrame: number | null = null;

  paint(theme: Theme): void {
    const isDark = "dark" === theme;

    this.writeMeta(
      StatusBarService.COLOR_META,
      isDark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT,
    );
    this.writeMeta(
      StatusBarService.STYLE_META,
      isDark
        ? StatusBarService.STYLE_TRANSLUCENT
        : StatusBarService.STYLE_OPAQUE,
    );
  }

  refresh(): void {
    const meta = this.metaOf(StatusBarService.COLOR_META);

    if (!meta) {
      return;
    }

    const view = this.document.defaultView;

    if (!view) {
      return;
    }

    const color = meta.content;
    const probe = this.probeOf(color);

    if (!probe) {
      return;
    }

    this.cancelPendingFrame(view);

    meta.content = probe;
    this.pendingFrame = view.requestAnimationFrame(() => {
      this.pendingFrame = null;

      if (meta.content !== probe) {
        return;
      }

      meta.content = color;
    });
  }

  private writeMeta(name: string, content: string): void {
    const meta = this.metaOf(name);

    if (!meta) {
      return;
    }

    meta.content = content;
  }

  private metaOf(name: string): HTMLMetaElement | null {
    return this.document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  }

  private cancelPendingFrame(view: Window): void {
    if (null === this.pendingFrame) {
      return;
    }

    view.cancelAnimationFrame(this.pendingFrame);
    this.pendingFrame = null;
  }

  private probeOf(color: string): string | null {
    if (!StatusBarService.HEX_COLOR.test(color)) {
      return null;
    }

    const channels = Number.parseInt(color.slice(1), 16) ^ 0x000001;

    return `#${channels.toString(16).padStart(6, "0")}`;
  }
}
