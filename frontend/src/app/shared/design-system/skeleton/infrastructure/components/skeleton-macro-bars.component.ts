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
        gap: 14px;
        background: var(--ds-surface-inset);
        border-radius: 16px;
        padding: 14px 16px;
      }
      .skmac__kcal {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .skmac__kcal-value {
        width: 62px;
        height: 24px;
        border-radius: var(--ds-radius-md);
      }
      .skmac__kcal-unit {
        width: 44px;
        height: 9px;
      }
      .skmac__bars {
        flex: 1 1 auto;
        display: flex;
        gap: 6px;
      }
      .skmac__bar {
        flex: 1 1 0;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .skmac__line {
        width: 100%;
        height: 6px;
        border-radius: 4px;
      }
      .skmac__label {
        width: 72%;
        height: 9px;
      }
      .skmac__value {
        width: 52%;
        height: 11px;
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
