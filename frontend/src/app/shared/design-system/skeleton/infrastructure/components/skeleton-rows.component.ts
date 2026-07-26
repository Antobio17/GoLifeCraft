import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-rows",
  standalone: true,
  template: `
    <div class="skrow" [class.skrow--card]="card">
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
        border-radius: var(--ds-radius-3xl);
        padding: 4px 14px;
      }
      .skrow__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 11px 0;
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
        width: 46px;
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
  },
})
export class SkeletonRowsComponent {
  @Input() rows = 6;
  @Input() divider = true;
  @Input() card = false;
  @Input() labelWidth = "42%";

  get rowArray(): number[] {
    return Array.from({ length: this.rows }, (_, index) => index);
  }

  delayFor(index: number): string {
    return `${index * 0.06}s`;
  }
}
