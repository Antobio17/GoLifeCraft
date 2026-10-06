import { Component, Input } from "@angular/core";
import { ProgressRingComponent } from "../../../progress-ring/infrastructure/components/progress-ring.component";
import { MacroGoal } from "../../../macro-panel/domain/models/macro-goal.model";

@Component({
  selector: "ds-diary-summary",
  imports: [ProgressRingComponent],
  template: `
    <section
      class="daysum"
      [class.daysum--dense]="dense"
      [attr.aria-label]="eyebrow"
    >
      <div class="daysum__head">
        <span class="daysum__eyebrow">
          <span
            class="daysum__pulse"
            [class.daysum__pulse--over]="over"
            aria-hidden="true"
          ></span>
          {{ eyebrow }}
        </span>
        <span class="daysum__count">{{ countLabel }}</span>
      </div>

      <div class="daysum__main">
        <ds-progress-ring
          class="daysum__ring"
          [class.daysum__ring--over]="over"
          [value]="percent"
          [hollow]="true"
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

      @if (macros.length) {
        <div class="daysum__macros" [style.--daysum-cols]="macros.length">
          @for (macro of macros; track macro.label) {
            <div class="macro">
              <span class="macro__label"
                >{{ macro.label }}
                @if (macro.overLabel) {
                  <span class="macro__over-label">{{ macro.overLabel }}</span>
                }
              </span>
              <span class="macro__value"
                >{{ macro.valueLabel }}
                @if (macro.goalLabel) {
                  <span class="macro__goal">/ {{ macro.goalLabel }}</span>
                }
              </span>
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
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .daysum {
        --ds-surface: var(--ds-sheet-surface);
        --ds-surface-inset: var(--ds-sheet-surface-inset);
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-3);
        padding: var(--ds-space-4);
        border-radius: var(--ds-radius-surface);
        background: var(--ds-hero-bg);
        border: 1px solid var(--ds-sheet-border);
        box-shadow: var(--ds-hero-shadow);
        color: var(--ds-text);
      }
      .daysum__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--ds-space-3);
      }
      .daysum__eyebrow {
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-2);
        min-width: 0;
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--ds-primary);
      }
      .daysum__pulse {
        flex: 0 0 auto;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background: var(--ds-primary);
        box-shadow: 0 0 0 0.1875rem var(--ds-primary-soft);
      }
      .daysum__pulse--over {
        background: var(--ds-danger);
        box-shadow: 0 0 0 0.1875rem
          color-mix(in srgb, var(--ds-danger) 18%, transparent);
      }
      .daysum__count {
        flex: 0 0 auto;
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
      }
      .daysum__main {
        display: flex;
        align-items: center;
        gap: var(--ds-space-4);
      }
      .daysum__ring {
        --ds-ring-fill: var(--ds-primary);
        --ds-ring-track: var(--ds-surface-inset);
      }
      .daysum__ring--over {
        --ds-ring-fill: var(--ds-danger);
      }
      .daysum__ring-value {
        font-size: var(--ds-text-md);
        color: var(--ds-text);
      }
      .daysum__kcal {
        min-width: 0;
      }
      .daysum__kcal-value {
        margin: 0;
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-bold);
        font-size: var(--ds-text-2xl);
        line-height: 1.05;
        letter-spacing: -0.02em;
        font-variant-numeric: tabular-nums;
      }
      .daysum__kcal-goal {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-semibold);
        letter-spacing: 0;
        color: var(--ds-text-muted);
      }
      .daysum__kcal-foot {
        margin: var(--ds-space-1) 0 0;
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
      }
      .daysum__kcal-foot--over {
        color: var(--ds-danger);
        font-weight: var(--ds-weight-semibold);
      }
      .daysum__macros {
        display: grid;
        grid-template-columns: repeat(var(--daysum-cols, 3), minmax(0, 1fr));
        background: var(--ds-surface-inset);
        border: 1px solid var(--ds-border-hairline);
        border-radius: var(--ds-radius-inner);
      }
      .macro {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        padding: var(--ds-space-2) var(--ds-space-3) var(--ds-space-3);
      }
      .macro + .macro {
        border-left: 1px solid var(--ds-border-hairline);
      }
      .macro__label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
      .macro__over-label {
        margin-left: var(--ds-space-1);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-danger);
      }
      .macro__value {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        line-height: var(--ds-leading-tight);
        font-variant-numeric: tabular-nums;
        color: var(--ds-text);
        margin-bottom: var(--ds-space-2);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .macro__goal {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
      .macro__track {
        display: flex;
        height: 0.3125rem;
        margin-top: auto;
        border-radius: var(--ds-radius-pill);
        background: color-mix(in srgb, var(--ds-text) 10%, transparent);
        overflow: hidden;
      }
      .macro__fill {
        display: block;
        height: 100%;
        border-radius: var(--ds-radius-pill);
        transition: width var(--ds-dur-4) var(--ds-ease-in-out);
      }
      .macro__fill--capped {
        border-radius: var(--ds-radius-pill) 0 0 var(--ds-radius-pill);
      }
      .macro__over {
        display: block;
        height: 100%;
        border-radius: 0 var(--ds-radius-pill) var(--ds-radius-pill) 0;
        background: var(--ds-danger);
        transition: width var(--ds-dur-4) var(--ds-ease-in-out);
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
      @media (max-width: 767.98px) {
        .daysum--dense {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          grid-template-areas:
            "ring kcal count"
            "macros macros macros";
          align-items: center;
          column-gap: var(--ds-space-3);
          row-gap: var(--ds-space-3);
          padding: var(--ds-space-3) var(--ds-space-4);
        }
        .daysum--dense .daysum__head,
        .daysum--dense .daysum__main {
          display: contents;
        }
        .daysum--dense .daysum__eyebrow {
          display: none;
        }
        .daysum--dense .daysum__count {
          grid-area: count;
          align-self: start;
          font-size: var(--ds-text-xs);
        }
        .daysum--dense .daysum__ring {
          grid-area: ring;
        }
        .daysum--dense .daysum__ring ::ng-deep .ring {
          width: 3rem;
          height: 3rem;
        }
        .daysum--dense .daysum__ring-value {
          font-size: var(--ds-text-xs);
        }
        .daysum--dense .daysum__kcal {
          grid-area: kcal;
        }
        .daysum--dense .daysum__kcal-value {
          font-size: var(--ds-text-xl);
        }
        .daysum--dense .daysum__kcal-goal {
          font-size: var(--ds-text-sm);
        }
        .daysum--dense .daysum__kcal-foot {
          margin-top: 0.125rem;
          font-size: var(--ds-text-xs);
        }
        .daysum--dense .daysum__macros {
          grid-area: macros;
        }
        .macro {
          padding: var(--ds-space-2);
        }
        .macro__label,
        .macro__goal {
          font-size: var(--ds-text-xs);
        }
        .macro__value {
          font-size: var(--ds-text-md);
        }
      }
      @media (min-width: 768px) {
        .daysum {
          gap: var(--ds-space-4);
          padding: var(--ds-space-5);
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
  @Input() dense = false;
}
