import { DOCUMENT } from "@angular/common";
import { Injectable, inject } from "@angular/core";

@Injectable({ providedIn: "root" })
export class StatusBarService {
  private static readonly HEX_COLOR = /^#[0-9a-f]{6}$/i;

  private readonly document = inject(DOCUMENT);

  private pendingFrame: number | null = null;

  refresh(): void {
    const meta = this.document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );

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
