import { Component, Input } from "@angular/core";

export type MetricCardVariant = "plain" | "feature";

@Component({
  selector: "ds-metric-card",
  standalone: true,
  template: `
    <div class="ds-metric" [class.ds-metric--feature]="variant === 'feature'">
      <div class="ds-metric__value">{{ value }}</div>
      <div class="ds-metric__label">{{ label }}</div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        flex: 1 1 0;
        min-width: 0;
      }
      .ds-metric {
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-lg);
        padding: 12px 13px;
        height: 100%;
        box-sizing: border-box;
      }
      .ds-metric--feature {
        background: var(--ds-surface-brand);
        border-color: var(--ds-surface-brand);
        color: var(--ds-on-surface-brand);
      }
      .ds-metric__value {
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: var(--ds-text-xl);
        line-height: 1;
        color: var(--ds-text);
      }
      .ds-metric--feature .ds-metric__value {
        color: var(--ds-on-surface-brand);
      }
      .ds-metric__label {
        margin-top: 5px;
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
      .ds-metric--feature .ds-metric__label {
        color: var(--ds-on-surface-brand);
        opacity: 0.82;
      }
    `,
  ],
})
export class MetricCardComponent {
  @Input() value: string | number = "";
  @Input() label = "";
  @Input() variant: MetricCardVariant = "plain";
}
