import {
  Component,
  ElementRef,
  HostListener,
  afterNextRender,
  inject,
  signal,
} from "@angular/core";

@Component({
  selector: "ds-scroll-row",
  template: `<ng-content />`,
  host: {
    "[class.is-fade-start]": "!atStart()",
    "[class.is-fade-end]": "!atEnd()",
  },
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        gap: var(--ds-scroll-row-gap, var(--ds-space-1));
        min-width: 0;
        overflow-x: auto;
        overscroll-behavior-x: contain;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
      }
      :host::-webkit-scrollbar {
        display: none;
      }
      :host.is-fade-start {
        mask-image: linear-gradient(
          90deg,
          transparent 0,
          #000 1.125rem,
          #000 100%
        );
      }
      :host.is-fade-end {
        mask-image: linear-gradient(
          90deg,
          #000 0,
          #000 calc(100% - 1.125rem),
          transparent 100%
        );
      }
      :host.is-fade-start.is-fade-end {
        mask-image: linear-gradient(
          90deg,
          transparent 0,
          #000 1.125rem,
          #000 calc(100% - 1.125rem),
          transparent 100%
        );
      }
    `,
  ],
})
export class ScrollRowComponent {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  atStart = signal(true);
  atEnd = signal(true);

  constructor() {
    afterNextRender(() => {
      this.updateEdges();
      new ResizeObserver(() => this.updateEdges()).observe(
        this.host.nativeElement,
      );
    });
  }

  @HostListener("scroll")
  onScroll(): void {
    this.updateEdges();
  }

  private updateEdges(): void {
    const element = this.host.nativeElement;
    const maxScroll = element.scrollWidth - element.clientWidth;

    this.atStart.set(element.scrollLeft <= 1);
    this.atEnd.set(element.scrollLeft >= maxScroll - 1);
  }
}
