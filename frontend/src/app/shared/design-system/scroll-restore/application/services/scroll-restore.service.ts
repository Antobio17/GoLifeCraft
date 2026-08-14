import { DOCUMENT } from "@angular/common";
import { Injectable, inject } from "@angular/core";

const MAX_FRAMES = 15;

@Injectable({ providedIn: "root" })
export class ScrollRestoreService {
  private readonly document = inject(DOCUMENT);

  currentTop(): number {
    return this.document.defaultView?.scrollY ?? 0;
  }

  restore(top: number): void {
    const view = this.document.defaultView;

    if (null === view || top <= 0) return;

    let frames = 0;
    let cancelled = false;

    const cancel = (): void => {
      cancelled = true;
    };

    const stop = (): void => {
      view.removeEventListener("wheel", cancel);
      view.removeEventListener("touchstart", cancel);
    };

    const step = (): void => {
      if (cancelled) {
        stop();

        return;
      }

      view.scrollTo({ top, behavior: "auto" });
      frames += 1;

      if (frames >= MAX_FRAMES) {
        stop();

        return;
      }

      view.requestAnimationFrame(step);
    };

    view.addEventListener("wheel", cancel, { passive: true });
    view.addEventListener("touchstart", cancel, { passive: true });
    view.requestAnimationFrame(step);
  }
}
