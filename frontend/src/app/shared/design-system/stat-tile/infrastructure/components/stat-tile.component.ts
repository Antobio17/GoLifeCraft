import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-stat-tile",
  standalone: true,
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
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: 14px;
        padding: 11px 12px;
      }
      .ds-stile__value {
        display: block;
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: 21px;
        line-height: 1;
        color: var(--ds-text);
      }
      .ds-stile__unit {
        font-size: 11px;
        font-weight: 600;
        color: var(--ds-text-meta);
      }
      .ds-stile__label {
        display: block;
        margin-top: 3px;
        font-size: 10px;
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
