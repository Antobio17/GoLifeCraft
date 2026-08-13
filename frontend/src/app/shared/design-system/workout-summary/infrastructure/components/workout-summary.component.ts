import { Component, Input } from "@angular/core";

export interface WorkoutSummaryStat {
  value: string;
  label: string;
  accent?: boolean;
}

@Component({
  selector: "ds-workout-summary",
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
        gap: var(--ds-space-3);
        padding: var(--ds-space-3) var(--ds-space-4);
        border-radius: var(--ds-radius-xl);
        background: var(--ds-surface-brand);
        color: var(--ds-on-surface-brand);
      }
      .ds-wksum__main {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1);
      }
      .ds-wksum__eyebrow {
        font-size: var(--ds-text-xs);
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--ds-accent);
      }
      .ds-wksum__date {
        font-size: var(--ds-text-base);
        font-weight: 600;
        opacity: 0.85;
        text-transform: capitalize;
      }
      .ds-wksum__stat {
        flex: 0 0 auto;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1);
      }
      .ds-wksum__value {
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: var(--ds-text-xl);
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }
      .ds-wksum__value--accent {
        color: var(--ds-accent);
      }
      .ds-wksum__label {
        font-size: var(--ds-text-xs);
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
