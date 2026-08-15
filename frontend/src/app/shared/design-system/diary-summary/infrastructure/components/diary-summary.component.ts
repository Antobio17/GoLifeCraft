import { Component, Input } from "@angular/core";
import { ProgressRingComponent } from "../../../progress-ring/infrastructure/components/progress-ring.component";
import { MacroGoal } from "../../../macro-panel/domain/models/macro-goal.model";

@Component({
  selector: "ds-diary-summary",
  imports: [ProgressRingComponent],
  template: `
    <div class="daysum">
      <div class="daysum__head">
        <span class="daysum__eyebrow">{{ eyebrow }}</span>
        <span class="daysum__count">{{ countLabel }}</span>
      </div>

      <div class="daysum__main">
        <ds-progress-ring
          class="daysum__ring"
          [class.daysum__ring--over]="over"
          [value]="percent"
        >
          <span class="daysum__ring-value">{{ percent }}%</span>
        </ds-progress-ring>
        <div class="daysum__kcal">
          <p class="daysum__kcal-value">
            {{ consumed }}
            @if (goal) {
              <span class="daysum__kcal-goal">/ {{ goal }}</span>
            }
          </p>
          <p class="daysum__kcal-foot" [class.daysum__kcal-foot--over]="over">
            {{ footnote }}
          </p>
        </div>
      </div>

      <div class="daysum__macros">
        @for (macro of macros; track macro.label) {
          <div class="macro">
            <div class="macro__top">
              <span class="macro__label">{{ macro.label }}</span>
              <span class="macro__value"
                >{{ macro.valueLabel }}
                @if (macro.goalLabel) {
                  <span class="macro__goal"> / {{ macro.goalLabel }}</span>
                }
                @if (macro.overLabel) {
                  <span class="macro__over-label">{{ macro.overLabel }}</span>
                }
              </span>
            </div>
            <span class="macro__track">
              <span
                class="macro__fill"
                [class.macro__fill--protein]="macro.tone === 'protein'"
                [class.macro__fill--fat]="macro.tone === 'fat'"
                [class.macro__fill--carbs]="macro.tone === 'carbs'"
                [class.macro__fill--capped]="macro.overPercent > 0"
                [style.width.%]="macro.percent"
              ></span>
              @if (macro.overPercent > 0) {
                <span
                  class="macro__over"
                  [style.width.%]="macro.overPercent"
                ></span>
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
      }
      .daysum {
        background: var(--ds-surface);
        color: var(--ds-text);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-lg);
        padding: var(--ds-space-4);
        box-shadow: var(--ds-elev);
      }
      .daysum__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .daysum__eyebrow {
        font-size: var(--ds-text-xs);
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--ds-primary);
      }
      .daysum__count {
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
      }
      .daysum__main {
        display: flex;
        align-items: center;
        gap: var(--ds-space-4);
        margin-top: var(--ds-space-3);
      }
      .daysum__ring {
        --ds-ring-fill: var(--ds-primary);
        --ds-ring-center: var(--ds-surface);
        --ds-ring-track: var(--ds-surface-inset);
      }
      .daysum__ring--over {
        --ds-ring-fill: var(--ds-danger);
      }
      .daysum__ring-value {
        font-size: var(--ds-text-md);
        color: var(--ds-text);
      }
      .daysum__kcal-value {
        margin: 0;
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: var(--ds-text-2xl);
        line-height: 1;
      }
      :host-context([data-theme="dark"]) .daysum__kcal-value {
        font-weight: 700;
      }
      .daysum__kcal-goal {
        font-size: var(--ds-text-md);
        font-weight: 600;
        color: var(--ds-text-meta);
      }
      .daysum__kcal-foot {
        margin: var(--ds-space-1) 0 0;
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
      }
      .daysum__kcal-foot--over {
        color: var(--ds-danger);
        font-weight: 600;
      }
      .daysum__macros {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-2);
        margin-top: var(--ds-space-4);
      }
      .macro {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1);
      }
      .macro__top {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
      }
      .macro__label {
        font-size: var(--ds-text-sm);
        font-weight: 600;
        color: var(--ds-text-muted);
      }
      .macro__value {
        font-size: var(--ds-text-sm);
        font-weight: 700;
        font-family: var(--ds-font-display);
      }
      .macro__goal {
        font-weight: 600;
        color: var(--ds-text-meta);
      }
      .macro__over-label {
        margin-left: var(--ds-space-1);
        font-weight: 700;
        color: var(--ds-danger);
      }
      .macro__track {
        display: flex;
        height: 0.375rem;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
        overflow: hidden;
      }
      .macro__fill {
        display: block;
        height: 100%;
        border-radius: var(--ds-radius-pill);
        transition: width 0.4s cubic-bezier(0.6, 0.05, 0.28, 0.98);
      }
      .macro__fill--capped {
        border-radius: var(--ds-radius-pill) 0 0 var(--ds-radius-pill);
      }
      .macro__over {
        display: block;
        height: 100%;
        border-radius: 0 var(--ds-radius-pill) var(--ds-radius-pill) 0;
        background: var(--ds-danger);
        border-left: 2px solid var(--ds-surface);
        transition: width 0.4s cubic-bezier(0.6, 0.05, 0.28, 0.98);
      }
      .macro__fill--protein {
        background: var(--ds-data-1);
      }
      .macro__fill--fat {
        background: var(--ds-data-3);
      }
      .macro__fill--carbs {
        background: var(--ds-data-2);
      }
      @media (min-width: 768px) {
        .daysum {
          padding: var(--ds-space-5) var(--ds-space-6);
          border-radius: var(--ds-radius-lg);
        }
        .daysum__kcal-value {
          font-size: var(--ds-text-3xl);
        }
      }
    `,
  ],
})
export class DiarySummaryComponent {
  @Input() eyebrow = "";
  @Input() countLabel = "";
  @Input() percent = 0;
  @Input() consumed: string | number = "";
  @Input() goal: string | number = "";
  @Input() footnote = "";
  @Input() over = false;
  @Input() macros: MacroGoal[] = [];
}
