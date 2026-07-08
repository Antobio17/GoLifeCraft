import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-stat",
  standalone: true,
  template: `
    <span class="ds-stat__value">
      {{ value }}
      @if (unit) {
        <span class="ds-stat__unit">{{ unit }}</span>
      }
    </span>
    <span class="ds-stat__label">{{ label }}</span>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .ds-stat__value {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-2xl);
        font-weight: var(--ds-weight-extrabold);
        line-height: 1.1;
        color: var(--ds-text);
      }
      .ds-stat__unit {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-meta);
        margin-left: 2px;
      }
      .ds-stat__label {
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-semibold);
        letter-spacing: 0.03em;
        text-transform: uppercase;
        color: var(--ds-text-meta);
      }
    `,
  ],
})
export class StatComponent {
  @Input() value: string | number = "";
  @Input() unit = "";
  @Input() label = "";
}
