import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-stat-tile",
  template: `
    <div class="ds-stile">
      <span class="ds-stile__value"
        >{{ value }}
        @if (unit) {
          <span class="ds-stile__unit">{{ unit }}</span>
        }
      </span>
      <span class="ds-stile__label">{{ label }}</span>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        flex: 1 1 0;
        min-width: 0;
      }
      .ds-stile {
        display: flex;
        flex-direction: column;
        height: 100%;
        box-sizing: border-box;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: 0.875rem;
        padding: 0.6875rem 0.75rem;
      }
      .ds-stile__value {
        display: block;
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: 1.3125rem;
        line-height: 1;
        color: var(--ds-text);
      }
      .ds-stile__unit {
        font-size: 0.6875rem;
        font-weight: 600;
        color: var(--ds-text-meta);
      }
      .ds-stile__label {
        display: block;
        margin-top: 0.1875rem;
        font-size: 0.625rem;
        font-weight: 600;
        color: var(--ds-text-muted);
      }
    `,
  ],
})
export class StatTileComponent {
  @Input() value: string | number = "";
  @Input() unit = "";
  @Input() label = "";
}
