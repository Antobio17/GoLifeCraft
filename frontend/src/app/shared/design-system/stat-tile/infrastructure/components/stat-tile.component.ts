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
        border-radius: var(--ds-radius-lg);
        padding: var(--ds-space-3);
      }
      .ds-stile__value {
        display: block;
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: var(--ds-text-xl);
        line-height: 1;
        color: var(--ds-text);
      }
      .ds-stile__unit {
        font-size: var(--ds-text-sm);
        font-weight: 600;
        color: var(--ds-text-meta);
      }
      .ds-stile__label {
        display: block;
        margin-top: var(--ds-space-1);
        font-size: var(--ds-text-xs);
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
