import { Component, Input } from "@angular/core";
import { MacroGoal } from "../../domain/models/macro-goal.model";

@Component({
  selector: "ds-macro-panel",
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
        gap: var(--ds-space-2);
        background: var(--ds-surface);
        color: var(--ds-text);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-xl);
        padding: var(--ds-space-3);
        box-shadow: var(--ds-elev);
      }
      .ds-mpanel__energy {
        display: flex;
        align-items: baseline;
        gap: var(--ds-space-1-5);
      }
      .ds-mpanel__kcal {
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: var(--ds-text-xl);
        line-height: 1;
        color: var(--ds-primary);
        white-space: nowrap;
      }
      .ds-mpanel__kcalGoal {
        font-size: var(--ds-text-sm);
        font-weight: 600;
        color: var(--ds-text-meta);
      }
      .ds-mpanel__caption {
        font-size: var(--ds-text-sm);
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--ds-text-muted);
      }
      .ds-mpanel__caption--over {
        color: var(--ds-danger);
        font-weight: 600;
      }
      .ds-mpanel__bars {
        display: flex;
        gap: var(--ds-space-2);
      }
      .ds-mpanel__bar {
        flex: 1 1 0;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1);
      }
      .ds-mpanel__label {
        font-size: var(--ds-text-xs);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--ds-text-muted);
      }
      .ds-mpanel__track {
        display: flex;
        height: 0.375rem;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
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
        background: var(--ds-data-1);
      }
      .ds-mpanel__fill--fat {
        background: var(--ds-data-3);
      }
      .ds-mpanel__fill--carbs {
        background: var(--ds-data-2);
      }
      .ds-mpanel__over {
        display: block;
        height: 100%;
        border-radius: 0 var(--ds-radius-pill) var(--ds-radius-pill) 0;
        background: var(--ds-danger);
        border-left: 2px solid var(--ds-surface);
        transition: width var(--ds-transition-base);
      }
      .ds-mpanel__value {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-bold);
        white-space: nowrap;
      }
      .ds-mpanel__value--over {
        color: var(--ds-danger);
      }
      .ds-mpanel__goal {
        font-weight: 600;
        color: var(--ds-text-meta);
      }
      .ds-mpanel__value--over .ds-mpanel__goal {
        color: color-mix(in srgb, var(--ds-danger) 70%, transparent);
      }
      @media (min-width: 768px) {
        .ds-mpanel {
          padding: var(--ds-space-3) var(--ds-space-4);
        }
        .ds-mpanel__kcal {
          font-size: var(--ds-text-2xl);
        }
        .ds-mpanel__label {
          font-size: var(--ds-text-sm);
        }
        .ds-mpanel__value {
          font-size: var(--ds-text-base);
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
