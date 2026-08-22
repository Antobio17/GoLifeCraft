import { DOCUMENT } from "@angular/common";
import { Injectable, RendererFactory2, inject } from "@angular/core";

@Injectable({ providedIn: "root" })
export class ScrollLockService {
  private static readonly LOCK_CLASS = "ds-scroll-locked";

  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(RendererFactory2).createRenderer(
    null,
    null,
  );
  private readonly owners = new Set<object>();

  lock(owner: object): void {
    this.owners.add(owner);
    this.apply();
  }

  release(owner: object): void {
    this.owners.delete(owner);
    this.apply();
  }

  private apply(): void {
    const body = this.document.body;

    if (0 === this.owners.size) {
      this.renderer.removeClass(body, ScrollLockService.LOCK_CLASS);

      return;
    }

    this.renderer.addClass(body, ScrollLockService.LOCK_CLASS);
  }
}
