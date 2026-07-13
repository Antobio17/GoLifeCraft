import { Component, Input } from "@angular/core";

export interface WorkoutSummaryStat {
  value: string;
  label: string;
  accent?: boolean;
}

@Component({
  selector: "ds-workout-summary",
  standalone: true,
  template: `
    <div class="ds-wksum">
      <div class="ds-wksum__main">
        <span class="ds-wksum__eyebrow">{{ eyebrow }}</span>
        <span class="ds-wksum__date">{{ date }}</span>
      </div>
      @for (stat of stats; track stat.label) {
        <div class="ds-wksum__stat">
          <span
            class="ds-wksum__value"
            [class.ds-wksum__value--accent]="stat.accent"
            >{{ stat.value }}</span
          >
          <span class="ds-wksum__label">{{ stat.label }}</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-wksum {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 13px 15px;
        border-radius: 16px;
        background: var(--ds-surface-brand);
        color: var(--ds-on-surface-brand);
      }
      .ds-wksum__main {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .ds-wksum__eyebrow {
        font-size: 9.5px;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--ds-accent);
      }
      .ds-wksum__date {
        font-size: 12px;
        font-weight: 600;
        opacity: 0.85;
        text-transform: capitalize;
      }
      .ds-wksum__stat {
        flex: 0 0 auto;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .ds-wksum__value {
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: 18px;
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }
      .ds-wksum__value--accent {
        color: var(--ds-accent);
      }
      .ds-wksum__label {
        font-size: 9px;
        font-weight: 600;
        opacity: 0.6;
      }
    `,
  ],
})
export class WorkoutSummaryComponent {
  @Input() eyebrow = "";
  @Input() date = "";
  @Input() stats: WorkoutSummaryStat[] = [];
}
