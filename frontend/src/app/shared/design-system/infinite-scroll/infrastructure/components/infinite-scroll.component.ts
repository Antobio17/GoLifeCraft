import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  inject,
} from "@angular/core";

@Component({
  selector: "ds-infinite-scroll",
  standalone: true,
  template: ``,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 1px;
      }
    `,
  ],
})
export class InfiniteScrollComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() disabled = false;
  @Input() rootMargin = "320px";
  @Output() reached = new EventEmitter<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;
  private visible = false;

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        this.visible = entries[entries.length - 1].isIntersecting;
        this.emitIfReady();
      },
      { rootMargin: this.rootMargin },
    );

    this.observer.observe(this.host.nativeElement);
  }

  ngOnChanges(): void {
    this.emitIfReady();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private emitIfReady(): void {
    if (this.disabled || !this.visible) return;

    this.reached.emit();
  }
}
