import { Component, Input } from "@angular/core";

type StrengthLevel = 0 | 1 | 2 | 3;

@Component({
  selector: "ds-password-strength",
  standalone: true,
  template: `
    @if (password) {
      <div class="ps">
        <div class="ps__bars">
          @for (bar of bars; track $index) {
            <span
              class="ps__bar"
              [class.ps__bar--on]="$index < score"
              [style.background]="$index < score ? color : null"
            ></span>
          }
        </div>
        <span class="ps__label" [style.color]="color">{{ label }}</span>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ps {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 2px;
      }
      .ps__bars {
        flex: 1 1 auto;
        display: flex;
        gap: 4px;
      }
      .ps__bar {
        flex: 1 1 0;
        height: 4px;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
        transition: background var(--ds-transition-base);
      }
      .ps__label {
        flex: 0 0 auto;
        font-size: 10.5px;
        font-weight: var(--ds-weight-extrabold);
        white-space: nowrap;
      }
    `,
  ],
})
export class PasswordStrengthComponent {
  @Input() password = "";
  @Input() weakLabel = "";
  @Input() mediumLabel = "";
  @Input() strongLabel = "";

  readonly bars = [0, 1, 2, 3];

  get score(): number {
    const value = this.password;
    if (!value) return 0;

    let points = 0;
    if (value.length >= 6) points++;
    if (value.length >= 10) points++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) points++;
    if (/\d/.test(value) && /[^a-zA-Z0-9]/.test(value)) points++;

    return Math.min(points, 4);
  }

  private get level(): StrengthLevel {
    const score = this.score;
    if (score <= 1) return 0;
    if (score === 2) return 1;
    if (score === 3) return 2;
    return 3;
  }

  get color(): string {
    const palette: Record<StrengthLevel, string> = {
      0: "var(--ds-danger)",
      1: "var(--ds-warning)",
      2: "var(--ds-warning)",
      3: "var(--ds-accent)",
    };
    return palette[this.level];
  }

  get label(): string {
    const labels: Record<StrengthLevel, string> = {
      0: this.weakLabel,
      1: this.mediumLabel,
      2: this.mediumLabel,
      3: this.strongLabel,
    };
    return labels[this.level];
  }
}
