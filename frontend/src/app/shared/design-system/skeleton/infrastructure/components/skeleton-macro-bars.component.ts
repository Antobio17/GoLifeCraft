import { Component, computed, input } from "@angular/core";

@Component({
  selector: "ds-skeleton-macro-bars",
  template: `
    <div class="skmac">
      <div class="skmac__kcal">
        <span class="ds-sk skmac__kcal-value"></span>
        <span class="ds-sk skmac__kcal-unit"></span>
      </div>
      <div class="skmac__bars">
        @for (macro of macroArray(); track macro; let i = $index) {
          <div class="skmac__bar" [style.--ds-sk-delay]="delayFor(i)">
            <span class="ds-sk skmac__line"></span>
            <span class="ds-sk skmac__label"></span>
            <span class="ds-sk skmac__value"></span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .skmac {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        background: var(--ds-surface-inset);
        border-radius: var(--ds-radius-xl);
        padding: var(--ds-space-3) var(--ds-space-4);
      }
      .skmac__kcal {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1-5);
      }
      .skmac__kcal-value {
        width: 3.875rem;
        height: 1.5rem;
        border-radius: var(--ds-radius-md);
      }
      .skmac__kcal-unit {
        width: 2.75rem;
        height: 0.5625rem;
      }
      .skmac__bars {
        flex: 1 1 auto;
        display: flex;
        gap: var(--ds-space-1-5);
      }
      .skmac__bar {
        flex: 1 1 0;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1);
      }
      .skmac__line {
        width: 100%;
        height: 0.375rem;
        border-radius: var(--ds-radius-sm);
      }
      .skmac__label {
        width: 72%;
        height: 0.5625rem;
      }
      .skmac__value {
        width: 52%;
        height: 0.6875rem;
      }
    `,
  ],
})
export class SkeletonMacroBarsComponent {
  readonly macros = input(3);

  readonly macroArray = computed<number[]>(() =>
    Array.from({ length: this.macros() }, (_, index) => index),
  );

  delayFor(index: number): string {
    return `${index * 0.08}s`;
  }
}
