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
        gap: 0.75rem;
        padding: 0.8125rem 0.9375rem;
        border-radius: 1rem;
        background: var(--ds-surface-brand);
        color: var(--ds-on-surface-brand);
      }
      .ds-wksum__main {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .ds-wksum__eyebrow {
        font-size: 0.59375rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--ds-accent);
      }
      .ds-wksum__date {
        font-size: 0.75rem;
        font-weight: 600;
        opacity: 0.85;
        text-transform: capitalize;
      }
      .ds-wksum__stat {
        flex: 0 0 auto;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 0.1875rem;
      }
      .ds-wksum__value {
        font-family: var(--ds-font-display);
        font-weight: 800;
        font-size: 1.125rem;
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }
      .ds-wksum__value--accent {
        color: var(--ds-accent);
      }
      .ds-wksum__label {
        font-size: 0.5625rem;
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
