import { Injectable, NgZone, OnDestroy, inject, signal } from "@angular/core";

@Injectable()
export class StickyCollapseService implements OnDestroy {
  private ngZone = inject(NgZone);

  readonly collapsed = signal(false);

  private readonly STICKY_TOP = 8;
  private readonly STICKY_BAND = 72;

  private sentinel?: HTMLElement;
  private observers: IntersectionObserver[] = [];

  track(element: HTMLElement | undefined): void {
    if (element === this.sentinel) {
      return;
    }

    this.teardown();
    this.sentinel = element;

    if (!element) {
      this.collapsed.set(false);
      return;
    }

    const collapseLine = this.STICKY_TOP + 1;
    const expandLine = collapseLine + this.STICKY_BAND;

    const collapseObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          return;
        }
        this.ngZone.run(() => this.collapsed.set(true));
      },
      { rootMargin: `-${collapseLine}px 0px 0px 0px`, threshold: 0 },
    );
    const expandObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }
        this.ngZone.run(() => this.collapsed.set(false));
      },
      { rootMargin: `-${expandLine}px 0px 0px 0px`, threshold: 0 },
    );

    collapseObserver.observe(element);
    expandObserver.observe(element);
    this.observers = [collapseObserver, expandObserver];
  }

  ngOnDestroy(): void {
    this.teardown();
  }

  private teardown(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    this.sentinel = undefined;
  }
}
