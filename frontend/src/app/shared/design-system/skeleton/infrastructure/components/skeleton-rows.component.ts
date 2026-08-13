import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-rows",
  template: `
    <div class="skrow" [class.skrow--card]="card">
      @if (header) {
        <div class="skrow__header">
          <span class="ds-sk skrow__header-title"></span>
          @if (badge) {
            <span class="ds-sk skrow__header-badge"></span>
          }
        </div>
      }

      @for (row of rowArray; track row; let i = $index; let last = $last) {
        <div
          class="skrow__row"
          [class.skrow__row--last]="last || !divider"
          [style.--ds-sk-delay]="delayFor(i)"
        >
          <span class="ds-sk skrow__label"></span>
          <span class="ds-sk skrow__value"></span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .skrow {
        display: flex;
        flex-direction: column;
      }
      .skrow--card {
        box-sizing: border-box;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-xl);
        overflow: hidden;
        --skrow-pad: var(--ds-space-3) var(--ds-space-4);
      }
      .skrow__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--ds-space-3);
        padding: var(--ds-space-3) var(--ds-space-4);
        border-bottom: 1px solid var(--ds-border);
      }
      .skrow__header-title {
        width: 8.25rem;
        height: 0.625rem;
      }
      .skrow__header-badge {
        width: 4.75rem;
        height: 1.25rem;
        border-radius: var(--ds-radius-pill);
      }
      .skrow__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--ds-space-4);
        padding: var(--skrow-pad, var(--ds-space-3) 0);
        border-bottom: 1px solid var(--ds-border);
      }
      .skrow__row--last {
        border-bottom: none;
      }
      .skrow__label {
        width: var(--skrow-label, 42%);
        height: 0.6875rem;
      }
      .skrow__value {
        width: var(--skrow-value, 2.875rem);
        height: 0.6875rem;
      }
      .skrow__row:nth-child(even) .skrow__label {
        width: 34%;
      }
      .skrow__row:nth-child(3n) .skrow__label {
        width: 50%;
      }
    `,
  ],
  host: {
    "[style.--skrow-label]": "labelWidth",
    "[style.--skrow-value]": "valueWidth",
  },
})
export class SkeletonRowsComponent {
  @Input() rows = 6;
  @Input() divider = true;
  @Input() card = false;
  @Input() header = false;
  @Input() badge = false;
  @Input() labelWidth = "42%";
  @Input() valueWidth = "2.875rem";

  get rowArray(): number[] {
    return Array.from({ length: this.rows }, (_, index) => index);
  }

  delayFor(index: number): string {
    return `${index * 0.06}s`;
  }
}
