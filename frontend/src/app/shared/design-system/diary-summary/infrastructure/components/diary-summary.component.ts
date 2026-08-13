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
        background: var(--ds-surface-brand);
        color: var(--ds-on-surface-brand);
        border: 1px solid transparent;
        border-radius: 1.375rem;
        padding: 1.0625rem 1.125rem;
        box-shadow: var(--ds-shadow-card);
      }
      :host-context([data-theme="dark"]) .daysum {
        border-color: var(--ds-border-hairline);
      }
      .daysum__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .daysum__eyebrow {
        font-size: 0.65625rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: var(--ds-accent);
      }
      .daysum__count {
        font-size: 0.6875rem;
        color: color-mix(in srgb, var(--ds-on-surface-brand) 60%, transparent);
      }
      .daysum__main {
        display: flex;
        align-items: center;
        gap: 0.9375rem;
        margin-top: 0.8125rem;
      }
      .daysum__ring {
        --ds-ring-fill: var(--ds-accent);
        --ds-ring-center: var(--ds-surface-brand);
        --ds-ring-track: color-mix(
          in srgb,
          var(--ds-on-surface-brand) 16%,
          transparent
        );
      }
      .daysum__ring--over {
        --ds-ring-fill: var(--ds-danger);
      }
      .daysum__ring-value {
        font-size: 0.875rem;
        color: var(--ds-on-surface-brand);
      }
      .daysum__kcal-value {
        margin: 0;
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: 1.5625rem;
        line-height: 1;
      }
      :host-context([data-theme="dark"]) .daysum__kcal-value {
        font-weight: 700;
      }
      .daysum__kcal-goal {
        font-size: 0.8125rem;
        font-weight: 600;
        color: color-mix(in srgb, var(--ds-on-surface-brand) 55%, transparent);
      }
      .daysum__kcal-foot {
        margin: 0.1875rem 0 0;
        font-size: 0.71875rem;
        color: color-mix(in srgb, var(--ds-on-surface-brand) 65%, transparent);
      }
      .daysum__kcal-foot--over {
        color: var(--ds-danger);
        font-weight: 600;
      }
      .daysum__macros {
        display: flex;
        flex-direction: column;
        gap: 0.5625rem;
        margin-top: 1rem;
      }
      .macro {
        display: flex;
        flex-direction: column;
        gap: 0.3125rem;
      }
      .macro__top {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
      }
      .macro__label {
        font-size: 0.6875rem;
        font-weight: 600;
        color: color-mix(in srgb, var(--ds-on-surface-brand) 70%, transparent);
      }
      .macro__value {
        font-size: 0.71875rem;
        font-weight: 700;
        font-family: var(--ds-font-display);
      }
      .macro__goal {
        font-weight: 600;
        color: color-mix(in srgb, var(--ds-on-surface-brand) 50%, transparent);
      }
      .macro__over-label {
        margin-left: 0.1875rem;
        font-weight: 700;
        color: var(--ds-danger);
      }
      .macro__track {
        display: flex;
        height: 0.375rem;
        border-radius: 62.4375rem;
        background: color-mix(
          in srgb,
          var(--ds-on-surface-brand) 13%,
          transparent
        );
        overflow: hidden;
      }
      .macro__fill {
        display: block;
        height: 100%;
        border-radius: 62.4375rem;
        transition: width 0.4s cubic-bezier(0.6, 0.05, 0.28, 0.98);
      }
      .macro__fill--capped {
        border-radius: 62.4375rem 0 0 62.4375rem;
      }
      .macro__over {
        display: block;
        height: 100%;
        border-radius: 0 62.4375rem 62.4375rem 0;
        background: var(--ds-danger);
        border-left: 2px solid var(--ds-surface-brand);
        transition: width 0.4s cubic-bezier(0.6, 0.05, 0.28, 0.98);
      }
      .macro__fill--protein {
        background: var(--ds-accent);
      }
      .macro__fill--fat {
        background: var(--ds-warning);
      }
      .macro__fill--carbs {
        background: color-mix(
          in srgb,
          var(--ds-on-surface-brand) 85%,
          transparent
        );
      }
      @media (min-width: 768px) {
        .daysum {
          padding: 1.375rem 1.5rem;
          border-radius: 1.5rem;
        }
        .daysum__kcal-value {
          font-size: 1.8125rem;
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
