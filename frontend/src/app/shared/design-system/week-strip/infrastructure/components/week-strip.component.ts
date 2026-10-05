import { Component, Input } from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { WeekStripDay } from "../../domain/models/week-strip-day.model";
import { WeekStripDayState } from "../../domain/models/week-strip-day-state.enum";

@Component({
  selector: "ds-week-strip",
  imports: [IconComponent],
  template: `
    <section class="ds-week" [attr.aria-label]="title">
      <div class="ds-week__head">
        <div class="ds-week__text">
          <span class="ds-week__title">{{ title }}</span>
          @if (caption) {
            <span class="ds-week__caption">{{ caption }}</span>
          }
        </div>
        @if (badgeLabel) {
          <span class="ds-week__badge">
            <ds-icon name="flame" [size]="14" [stroke]="2.2" />
            {{ badgeLabel }}
          </span>
        }
      </div>

      <ol class="ds-week__days">
        @for (day of days; track day.key) {
          <li class="ds-week__day" [attr.aria-label]="day.ariaLabel">
            <span class="ds-week__weekday" aria-hidden="true">
              {{ day.weekday }}
            </span>
            <span
              class="ds-week__dot"
              [class.ds-week__dot--done]="day.state === state.Done"
              [class.ds-week__dot--today]="day.state === state.Today"
              aria-hidden="true"
            >
              {{ day.day }}
            </span>
          </li>
        }
      </ol>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-week {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-3);
        padding: var(--ds-space-4);
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-2xl);
        box-shadow: var(--ds-shadow-card);
      }
      .ds-week__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--ds-space-3);
      }
      .ds-week__text {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .ds-week__title {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text);
      }
      .ds-week__caption {
        font-size: var(--ds-text-base);
        color: var(--ds-text-muted);
      }
      .ds-week__badge {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-1-5);
        padding: var(--ds-space-1-5) var(--ds-space-3);
        border-radius: var(--ds-radius-pill);
        background: var(--ds-warning-soft);
        color: var(--ds-warning);
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-bold);
      }
      .ds-week__days {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: var(--ds-space-1-5);
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .ds-week__day {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--ds-space-1-5);
      }
      .ds-week__weekday {
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ds-text-muted);
      }
      .ds-week__dot {
        box-sizing: border-box;
        width: 2.375rem;
        height: 2.375rem;
        max-width: 100%;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ds-surface-inset);
        color: var(--ds-text-muted);
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-semibold);
        font-variant-numeric: tabular-nums;
      }
      .ds-week__dot--done {
        background: var(--ds-primary);
        color: var(--ds-on-primary);
        font-weight: var(--ds-weight-bold);
      }
      .ds-week__dot--today {
        background: transparent;
        border: 2px dashed var(--ds-primary);
        color: var(--ds-primary);
        font-weight: var(--ds-weight-bold);
      }
    `,
  ],
})
export class WeekStripComponent {
  @Input() title = "";
  @Input() caption = "";
  @Input() badgeLabel = "";
  @Input() days: WeekStripDay[] = [];

  protected readonly state = WeekStripDayState;
}
