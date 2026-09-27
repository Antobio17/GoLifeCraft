import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, fromEvent } from "rxjs";

@Component({
  selector: "ds-scale-ruler",
  template: `
    <div
      class="ruler"
      role="slider"
      tabindex="0"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-valuemin]="min()"
      [attr.aria-valuemax]="max()"
      [attr.aria-valuenow]="value()"
      (keydown.arrowleft)="onKey($event, -1)"
      (keydown.arrowdown)="onKey($event, -1)"
      (keydown.arrowright)="onKey($event, 1)"
      (keydown.arrowup)="onKey($event, 1)"
    >
      <div #track class="ruler__track" (scroll)="onScroll()">
        <div
          class="ruler__scale"
          [style.width.px]="scaleWidth()"
          [style.--ruler-spacing.px]="spacing()"
          [style.--ruler-major.px]="spacing() * majorEvery()"
        >
          @for (label of labels(); track label.value) {
            <span class="ruler__label" [style.left.px]="label.offset">{{
              label.text
            }}</span>
          }
        </div>
      </div>
      <span class="ruler__needle" aria-hidden="true"></span>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ruler {
        position: relative;
        border-radius: var(--ds-radius-lg);
        outline: none;
      }
      .ruler:focus-visible {
        box-shadow: var(--ds-focus-ring);
      }
      .ruler__track {
        container-type: inline-size;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none;
        overscroll-behavior-x: contain;
        -webkit-mask-image: linear-gradient(
          to right,
          transparent,
          #000 22%,
          #000 78%,
          transparent
        );
        mask-image: linear-gradient(
          to right,
          transparent,
          #000 22%,
          #000 78%,
          transparent
        );
        cursor: grab;
      }
      .ruler__track::-webkit-scrollbar {
        display: none;
      }
      .ruler__scale {
        position: relative;
        box-sizing: content-box;
        height: 3.5rem;
        padding: 0 50cqw;
        background-image:
          linear-gradient(
            to right,
            var(--ds-text-meta) 0 1.5px,
            transparent 1.5px
          ),
          linear-gradient(to right, var(--ds-border) 0 1px, transparent 1px);
        background-size:
          var(--ruler-major) 1.5rem,
          var(--ruler-spacing) 0.875rem;
        background-repeat: repeat-x;
        background-position:
          0 0,
          0 0;
        background-origin: content-box;
        background-clip: content-box;
      }
      .ruler__label {
        position: absolute;
        bottom: 0.25rem;
        transform: translateX(-50%);
        margin-left: 50cqw;
        font-size: var(--ds-text-sm);
        font-weight: 700;
        color: var(--ds-text-meta);
        font-variant-numeric: tabular-nums;
        pointer-events: none;
        user-select: none;
      }
      .ruler__needle {
        position: absolute;
        top: -0.25rem;
        left: 50%;
        width: 3px;
        height: 2.125rem;
        margin-left: -1.5px;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-primary);
        pointer-events: none;
      }
    `,
  ],
})
export class ScaleRulerComponent {
  value = input(0);
  min = input(0);
  max = input(100);
  step = input(1);
  spacing = input(8);
  majorEvery = input(10);
  ariaLabel = input("");

  valueChange = output<number>();

  private track = viewChild.required<ElementRef<HTMLElement>>("track");
  private lastEmitted: number | null = null;

  scaleWidth = computed(
    () => ((this.max() - this.min()) / this.step()) * this.spacing(),
  );

  labels = computed(() => {
    const every = this.step() * this.majorEvery();
    const labels = [];
    for (let value = this.min(); value <= this.max() + 1e-9; value += every) {
      labels.push({
        value,
        text: String(Math.round(value * 100) / 100),
        offset: ((value - this.min()) / this.step()) * this.spacing(),
      });
    }

    return labels;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterRenderEffect(() => {
      const value = this.value();
      if (value === this.lastEmitted) return;

      this.lastEmitted = null;
      this.track().nativeElement.scrollLeft = this.offsetOf(value);
    });

    afterNextRender(() => {
      fromEvent(this.track().nativeElement, "scroll")
        .pipe(debounceTime(140), takeUntilDestroyed(destroyRef))
        .subscribe(() => this.snap());
    });
  }

  onScroll(): void {
    const value = this.valueAt(this.track().nativeElement.scrollLeft);
    if (value === this.value() || value === this.lastEmitted) return;

    this.lastEmitted = value;
    this.valueChange.emit(value);
  }

  onKey(event: Event, direction: 1 | -1): void {
    event.preventDefault();
    const next = this.clamp(this.value() + direction * this.step());
    if (next === this.value()) return;

    this.lastEmitted = null;
    this.valueChange.emit(next);
  }

  private snap(): void {
    const element = this.track().nativeElement;
    const target = this.offsetOf(this.valueAt(element.scrollLeft));
    if (Math.abs(element.scrollLeft - target) < 0.5) return;

    element.scrollTo({ left: target, behavior: "smooth" });
  }

  private valueAt(scrollLeft: number): number {
    const index = Math.round(scrollLeft / this.spacing());

    return this.clamp(
      Math.round((this.min() + index * this.step()) * 100) / 100,
    );
  }

  private offsetOf(value: number): number {
    return ((this.clamp(value) - this.min()) / this.step()) * this.spacing();
  }

  private clamp(value: number): number {
    return Math.min(this.max(), Math.max(this.min(), value));
  }
}
