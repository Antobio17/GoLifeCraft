import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  signal,
} from "@angular/core";

@Directive({
  selector: "[dsStuck]",
  host: { "[class.is-stuck]": "stuck()" },
})
export class StuckDirective {
  private host = inject(ElementRef<HTMLElement>).nativeElement;
  private destroyRef = inject(DestroyRef);

  protected readonly stuck = signal(false);

  constructor() {
    afterNextRender(() => this.observe());
  }

  private observe(): void {
    const stickyTop = parseFloat(getComputedStyle(this.host).top) || 0;
    const observer = new IntersectionObserver(
      ([entry]) =>
        this.stuck.set(
          entry.intersectionRatio < 1 &&
            entry.boundingClientRect.top <= (entry.rootBounds?.top ?? 0),
        ),
      { rootMargin: `-${stickyTop + 1}px 0px 0px 0px`, threshold: [0, 1] },
    );

    observer.observe(this.host);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
