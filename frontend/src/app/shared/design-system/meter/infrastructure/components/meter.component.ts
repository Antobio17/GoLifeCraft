import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-meter",
  standalone: true,
  template: `
    <div class="ds-meter">
      <div class="ds-meter__row">
        <span class="ds-meter__dot"></span>
        <span class="ds-meter__label">{{ label }}</span>
        <span class="ds-meter__pct">{{ percent }}%</span>
      </div>
      <div
        class="ds-meter__track"
        role="progressbar"
        [attr.aria-valuenow]="percent"
        aria-valuemin="0"
        aria-valuemax="100"
        [attr.aria-label]="label"
      >
        <div class="ds-meter__fill" [style.width.%]="percent"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .ds-meter {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .ds-meter__row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .ds-meter__dot {
        width: 8px;
        height: 8px;
        border-radius: var(--ds-radius-pill);
        background: var(--meter-color, var(--ds-primary));
      }
      .ds-meter__label {
        flex: 1 1 auto;
        min-width: 0;
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-body);
      }
      .ds-meter__pct {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text-meta);
      }
      .ds-meter__track {
        height: 8px;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
        overflow: hidden;
      }
      .ds-meter__fill {
        height: 100%;
        border-radius: var(--ds-radius-pill);
        background: var(--meter-color, var(--ds-primary));
        transition: width var(--ds-transition-smooth);
      }
    `,
  ],
  host: {
    "[style.--meter-color]": "color",
  },
})
export class MeterComponent {
  @Input() label = "";
  @Input() percent = 0;
  @Input() color = "var(--ds-primary)";
}
