import { Component, Input } from "@angular/core";
import { MacroPanelBar } from "../../domain/models/macro-panel-bar.model";

@Component({
  selector: "ds-macro-panel",
  standalone: true,
  template: `
    <div class="ds-mpanel">
      <div class="ds-mpanel__energy">
        <span class="ds-mpanel__kcal">{{ kcal }}</span>
        <span class="ds-mpanel__caption">{{ caption }}</span>
      </div>
      <div class="ds-mpanel__bars">
        @for (bar of bars; track bar.label) {
          <div class="ds-mpanel__bar">
            <span class="ds-mpanel__label">{{ bar.label }}</span>
            <span class="ds-mpanel__track">
              <span
                class="ds-mpanel__fill"
                [class.ds-mpanel__fill--protein]="bar.tone === 'protein'"
                [class.ds-mpanel__fill--fat]="bar.tone === 'fat'"
                [class.ds-mpanel__fill--carbs]="bar.tone === 'carbs'"
                [style.width.%]="bar.percent"
              ></span>
            </span>
            <span class="ds-mpanel__value">{{ bar.value }}</span>
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
      .ds-mpanel {
        display: flex;
        align-items: center;
        gap: 14px;
        background: var(--ds-surface-brand);
        color: var(--ds-on-surface-brand);
        border: 1px solid transparent;
        border-radius: 16px;
        padding: 14px 16px;
      }
      :host-context([data-theme="dark"]) .ds-mpanel {
        border-color: var(--ds-border-hairline);
      }
      .ds-mpanel__energy {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .ds-mpanel__kcal {
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: 28px;
        line-height: 1;
        color: var(--ds-accent);
      }
      .ds-mpanel__caption {
        font-size: 11px;
        color: color-mix(in srgb, var(--ds-on-surface-brand) 70%, transparent);
      }
      .ds-mpanel__bars {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        gap: 8px;
      }
      .ds-mpanel__bar {
        flex: 1 1 0;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .ds-mpanel__label {
        font-size: 10px;
        color: color-mix(in srgb, var(--ds-on-surface-brand) 70%, transparent);
      }
      .ds-mpanel__track {
        display: block;
        height: 6px;
        border-radius: var(--ds-radius-pill);
        background: color-mix(
          in srgb,
          var(--ds-on-surface-brand) 16%,
          transparent
        );
        overflow: hidden;
      }
      .ds-mpanel__fill {
        display: block;
        height: 100%;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-accent);
        transition: width var(--ds-transition-base);
      }
      .ds-mpanel__value {
        font-size: 11px;
        font-weight: var(--ds-weight-bold);
      }
    `,
  ],
})
export class MacroPanelComponent {
  @Input() kcal = "";
  @Input() caption = "";
  @Input() bars: MacroPanelBar[] = [];
}
