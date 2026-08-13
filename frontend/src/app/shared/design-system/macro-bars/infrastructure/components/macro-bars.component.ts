import { Component, Input } from "@angular/core";
import { MacroBar } from "../../domain/models/macro-bar.model";

@Component({
  selector: "ds-macro-bars",
  template: `
    <div class="ds-macro">
      <div class="ds-macro__kcal">
        <span class="ds-macro__kcalValue">{{ kcal }}</span>
        <span class="ds-macro__kcalUnit">{{ kcalUnit }}</span>
      </div>
      <div class="ds-macro__bars">
        @for (macro of macros; track macro.label) {
          <div class="ds-macro__bar">
            <span
              class="ds-macro__line"
              [class.ds-macro__line--protein]="macro.tone === 'protein'"
              [class.ds-macro__line--fat]="macro.tone === 'fat'"
              [class.ds-macro__line--carbs]="macro.tone === 'carbs'"
            ></span>
            <span class="ds-macro__label">{{ macro.label }}</span>
            <span class="ds-macro__value">{{ macro.value }}</span>
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
      .ds-macro {
        display: flex;
        align-items: center;
        gap: 0.875rem;
        background: var(--ds-surface-inset);
        border-radius: 1rem;
        padding: 0.875rem 1rem;
      }
      .ds-macro__kcal {
        display: flex;
        flex-direction: column;
        flex: 0 0 auto;
      }
      .ds-macro__kcalValue {
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: 1.75rem;
        line-height: 1;
        color: var(--ds-primary);
      }
      .ds-macro__kcalUnit {
        font-size: 0.6875rem;
        color: var(--ds-text-muted);
        margin-top: 2px;
      }
      .ds-macro__bars {
        flex: 1 1 auto;
        display: flex;
        gap: 0.375rem;
      }
      .ds-macro__bar {
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
      }
      .ds-macro__line {
        height: 0.375rem;
        border-radius: 0.25rem;
        margin-bottom: 0.3125rem;
      }
      .ds-macro__line--protein {
        background: var(--ds-primary);
      }
      .ds-macro__line--fat {
        background: var(--ds-warning);
      }
      .ds-macro__line--carbs {
        background: var(--ds-accent);
      }
      .ds-macro__label {
        font-size: 0.625rem;
        color: var(--ds-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-macro__value {
        font-size: 0.71875rem;
        font-weight: 700;
        color: var(--ds-text);
      }
    `,
  ],
})
export class MacroBarsComponent {
  @Input() kcal: string | number = "—";
  @Input() kcalUnit = "";
  @Input() macros: MacroBar[] = [];
}
