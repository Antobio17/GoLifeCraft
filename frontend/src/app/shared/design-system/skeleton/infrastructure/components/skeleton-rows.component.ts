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
        border-radius: 18px;
        overflow: hidden;
        --skrow-pad: 12px 16px;
      }
      .skrow__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 13px 16px;
        border-bottom: 1px solid var(--ds-border);
      }
      .skrow__header-title {
        width: 132px;
        height: 10px;
      }
      .skrow__header-badge {
        width: 76px;
        height: 20px;
        border-radius: var(--ds-radius-pill);
      }
      .skrow__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: var(--skrow-pad, 11px 0);
        border-bottom: 1px solid var(--ds-border);
      }
      .skrow__row--last {
        border-bottom: none;
      }
      .skrow__label {
        width: var(--skrow-label, 42%);
        height: 11px;
      }
      .skrow__value {
        width: var(--skrow-value, 46px);
        height: 11px;
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
  @Input() valueWidth = "46px";

  get rowArray(): number[] {
    return Array.from({ length: this.rows }, (_, index) => index);
  }

  delayFor(index: number): string {
    return `${index * 0.06}s`;
  }
}
