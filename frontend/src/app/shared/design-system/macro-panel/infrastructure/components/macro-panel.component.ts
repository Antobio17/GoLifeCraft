import { Component, Input } from "@angular/core";
import { MacroGoal } from "../../domain/models/macro-goal.model";

@Component({
  selector: "ds-macro-panel",
  standalone: true,
  template: `
    <div class="ds-mpanel">
      <div class="ds-mpanel__energy">
        <span class="ds-mpanel__kcal"
          >{{ kcal }}
          @if (kcalGoal) {
            <span class="ds-mpanel__kcalGoal">/{{ kcalGoal }}</span>
          }
        </span>
        <span class="ds-mpanel__caption" [class.ds-mpanel__caption--over]="over"
          >{{ caption }}
        </span>
      </div>
      <div class="ds-mpanel__bars">
        @for (macro of macros; track macro.label) {
          <div class="ds-mpanel__bar">
            <span class="ds-mpanel__label">{{ macro.label }}</span>
            <span class="ds-mpanel__track">
              <span
                class="ds-mpanel__fill"
                [class.ds-mpanel__fill--protein]="macro.tone === 'protein'"
                [class.ds-mpanel__fill--fat]="macro.tone === 'fat'"
                [class.ds-mpanel__fill--carbs]="macro.tone === 'carbs'"
                [class.ds-mpanel__fill--capped]="macro.overPercent > 0"
                [style.width.%]="macro.percent"
              ></span>
              @if (macro.overPercent > 0) {
                <span
                  class="ds-mpanel__over"
                  [style.width.%]="macro.overPercent"
                ></span>
              }
            </span>
            <span
              class="ds-mpanel__value"
              [class.ds-mpanel__value--over]="macro.overPercent > 0"
              >{{ macro.valueLabel }}
              @if (macro.goalLabel) {
                <span class="ds-mpanel__goal">/{{ macro.goalLabel }}</span>
              }
            </span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .ds-mpanel {
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: var(--ds-surface-brand);
        color: var(--ds-on-surface-brand);
        border: 1px solid transparent;
        border-radius: 16px;
        padding: 12px 14px;
      }
      :host-context([data-theme="dark"]) .ds-mpanel {
        border-color: var(--ds-border-hairline);
      }
      .ds-mpanel__energy {
        display: flex;
        align-items: baseline;
        gap: 7px;
      }
      .ds-mpanel__kcal {
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: 21px;
        line-height: 1;
        color: var(--ds-accent);
        white-space: nowrap;
      }
      .ds-mpanel__kcalGoal {
        font-size: 11.5px;
        font-weight: 600;
        color: color-mix(in srgb, var(--ds-on-surface-brand) 55%, transparent);
      }
      .ds-mpanel__caption {
        font-size: 11px;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: color-mix(in srgb, var(--ds-on-surface-brand) 70%, transparent);
      }
      .ds-mpanel__caption--over {
        color: var(--ds-danger);
        font-weight: 600;
      }
      .ds-mpanel__bars {
        display: flex;
        gap: 9px;
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
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: color-mix(in srgb, var(--ds-on-surface-brand) 70%, transparent);
      }
      .ds-mpanel__track {
        display: flex;
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
      .ds-mpanel__fill--capped {
        border-radius: var(--ds-radius-pill) 0 0 var(--ds-radius-pill);
      }
      .ds-mpanel__fill--protein {
        background: var(--ds-accent);
      }
      .ds-mpanel__fill--fat {
        background: var(--ds-warning);
      }
      .ds-mpanel__fill--carbs {
        background: color-mix(
          in srgb,
          var(--ds-on-surface-brand) 85%,
          transparent
        );
      }
      .ds-mpanel__over {
        display: block;
        height: 100%;
        border-radius: 0 var(--ds-radius-pill) var(--ds-radius-pill) 0;
        background: var(--ds-danger);
        border-left: 2px solid var(--ds-surface-brand);
        transition: width var(--ds-transition-base);
      }
      .ds-mpanel__value {
        font-size: 11px;
        font-weight: var(--ds-weight-bold);
        white-space: nowrap;
      }
      .ds-mpanel__value--over {
        color: var(--ds-danger);
      }
      .ds-mpanel__goal {
        font-weight: 600;
        color: color-mix(in srgb, var(--ds-on-surface-brand) 55%, transparent);
      }
      .ds-mpanel__value--over .ds-mpanel__goal {
        color: color-mix(in srgb, var(--ds-danger) 70%, transparent);
      }
      @media (min-width: 768px) {
        .ds-mpanel {
          padding: 14px 16px;
        }
        .ds-mpanel__kcal {
          font-size: 25px;
        }
        .ds-mpanel__label {
          font-size: 11px;
        }
        .ds-mpanel__value {
          font-size: 12px;
        }
      }
    `,
  ],
})
export class MacroPanelComponent {
  @Input() kcal = "";
  @Input() kcalGoal = "";
  @Input() caption = "";
  @Input() over = false;
  @Input() macros: MacroGoal[] = [];
}
