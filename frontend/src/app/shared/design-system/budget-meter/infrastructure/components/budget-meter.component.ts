import { Component, Input } from "@angular/core";

export type BudgetMeterTone = "positive" | "warning" | "danger";

const TONE_COLOR: Record<BudgetMeterTone, string> = {
  positive: "var(--ds-success)",
  warning: "var(--ds-warning)",
  danger: "var(--ds-danger)",
};

@Component({
  selector: "ds-budget-meter",
  template: `
    <div class="ds-budget-meter" [style.--budget-meter-height.rem]="heightRem">
      <div
        class="ds-budget-meter__track"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        [attr.aria-valuenow]="fill"
        [attr.aria-label]="ariaLabel || null"
      >
        <span
          class="ds-budget-meter__fill"
          [style.width.%]="fill"
          [style.background]="color"
        ></span>
      </div>

      @if (showPace) {
        <span
          class="ds-budget-meter__pace"
          [style.left.%]="pace"
          [attr.aria-hidden]="true"
        ></span>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-budget-meter {
        position: relative;
        height: var(--budget-meter-height, 0.75rem);
      }
      .ds-budget-meter__track {
        position: absolute;
        inset: 0;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
        overflow: hidden;
      }
      .ds-budget-meter__fill {
        display: block;
        height: 100%;
        border-radius: var(--ds-radius-pill);
        transition: width var(--ds-transition-smooth);
      }
      /* La marca del ritmo sobresale por arriba y por abajo para que se lea
         como una regla sobre la barra y no como parte del relleno. */
      .ds-budget-meter__pace {
        position: absolute;
        top: -0.1875rem;
        bottom: -0.1875rem;
        width: 0.125rem;
        margin-left: -0.0625rem;
        border-radius: var(--ds-radius-sm);
        background: var(--ds-text);
        opacity: 0.55;
      }
    `,
  ],
})
export class BudgetMeterComponent {
  @Input() ratio = 0;
  @Input() paceRatio = 0;
  @Input() tone: BudgetMeterTone = "positive";
  @Input() showPace = true;
  @Input() heightRem = 0.75;
  @Input() ariaLabel = "";

  get fill(): number {
    return this.clamp(this.ratio);
  }

  get pace(): number {
    return this.clamp(this.paceRatio);
  }

  get color(): string {
    return TONE_COLOR[this.tone];
  }

  private clamp(value: number): number {
    return Math.min(100, Math.max(0, Math.round(value * 100)));
  }
}
