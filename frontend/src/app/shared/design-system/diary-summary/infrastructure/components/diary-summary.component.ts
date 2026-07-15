import { Component, Input } from "@angular/core";
import { ProgressRingComponent } from "../../../progress-ring/infrastructure/components/progress-ring.component";

export type DiaryMacroTone = "protein" | "fat" | "carbs";

export interface DiaryMacroGoal {
  label: string;
  valueLabel: string;
  goalLabel: string;
  percent: number;
  tone: DiaryMacroTone;
}

@Component({
  selector: "ds-diary-summary",
  standalone: true,
  imports: [ProgressRingComponent],
  template: `
    <div class="daysum">
      <div class="daysum__head">
        <span class="daysum__eyebrow">{{ eyebrow }}</span>
        <span class="daysum__count">{{ countLabel }}</span>
      </div>

      <div class="daysum__main">
        <ds-progress-ring class="daysum__ring" [value]="percent">
          <span class="daysum__ring-value">{{ percent }}%</span>
        </ds-progress-ring>
        <div class="daysum__kcal">
          <p class="daysum__kcal-value">
            {{ consumed }}
            <span class="daysum__kcal-goal">/ {{ goal }}</span>
          </p>
          <p class="daysum__kcal-foot">{{ footnote }}</p>
        </div>
      </div>

      <div class="daysum__macros">
        @for (macro of macros; track macro.label) {
          <div class="macro">
            <div class="macro__top">
              <span class="macro__label">{{ macro.label }}</span>
              <span class="macro__value"
                >{{ macro.valueLabel
                }}<span class="macro__goal">
                  / {{ macro.goalLabel }}</span
                ></span
              >
            </div>
            <span class="macro__track">
              <span
                class="macro__fill"
                [class.macro__fill--protein]="macro.tone === 'protein'"
                [class.macro__fill--fat]="macro.tone === 'fat'"
                [class.macro__fill--carbs]="macro.tone === 'carbs'"
                [style.width.%]="macro.percent"
              ></span>
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
        border-radius: 22px;
        padding: 17px 18px;
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
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: var(--ds-accent);
      }
      .daysum__count {
        font-size: 11px;
        color: color-mix(in srgb, var(--ds-on-surface-brand) 60%, transparent);
      }
      .daysum__main {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-top: 13px;
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
      .daysum__ring-value {
        font-size: 14px;
        color: var(--ds-on-surface-brand);
      }
      .daysum__kcal-value {
        margin: 0;
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: 25px;
        line-height: 1;
      }
      :host-context([data-theme="dark"]) .daysum__kcal-value {
        font-weight: 700;
      }
      .daysum__kcal-goal {
        font-size: 13px;
        font-weight: 600;
        color: color-mix(in srgb, var(--ds-on-surface-brand) 55%, transparent);
      }
      .daysum__kcal-foot {
        margin: 3px 0 0;
        font-size: 11.5px;
        color: color-mix(in srgb, var(--ds-on-surface-brand) 65%, transparent);
      }
      .daysum__macros {
        display: flex;
        flex-direction: column;
        gap: 9px;
        margin-top: 16px;
      }
      .macro {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .macro__top {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
      }
      .macro__label {
        font-size: 11px;
        font-weight: 600;
        color: color-mix(in srgb, var(--ds-on-surface-brand) 70%, transparent);
      }
      .macro__value {
        font-size: 11.5px;
        font-weight: 700;
        font-family: var(--ds-font-display);
      }
      .macro__goal {
        font-weight: 600;
        color: color-mix(in srgb, var(--ds-on-surface-brand) 50%, transparent);
      }
      .macro__track {
        display: block;
        height: 6px;
        border-radius: 999px;
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
        border-radius: 999px;
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
          padding: 22px 24px;
          border-radius: 24px;
        }
        .daysum__kcal-value {
          font-size: 29px;
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
  @Input() macros: DiaryMacroGoal[] = [];
}
