import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { MonthHeatmapCell } from "../../domain/models/month-heatmap-cell.model";

@Component({
  selector: "ds-month-heatmap",
  imports: [IconComponent],
  template: `
    <section class="ds-mheat" [attr.aria-label]="title">
      <div class="ds-mheat__head">
        <button
          type="button"
          class="ds-mheat__nav"
          [disabled]="!canPrevious"
          [attr.aria-label]="previousLabel"
          (click)="previous.emit()"
        >
          <ds-icon name="chevronLeft" [size]="16" [stroke]="2.4" />
        </button>
        <span class="ds-mheat__title" aria-live="polite">{{ title }}</span>
        <button
          type="button"
          class="ds-mheat__nav"
          [disabled]="!canNext"
          [attr.aria-label]="nextLabel"
          (click)="next.emit()"
        >
          <ds-icon name="chevronRight" [size]="16" [stroke]="2.4" />
        </button>
      </div>

      <div class="ds-mheat__grid" role="list">
        @for (weekday of weekdayLabels; track $index) {
          <span class="ds-mheat__weekday" aria-hidden="true">{{
            weekday
          }}</span>
        }
        @for (cell of cells; track cell.key) {
          @if (cell.label) {
            <span
              role="listitem"
              class="ds-mheat__cell"
              [class.ds-mheat__cell--l1]="cell.level === 1"
              [class.ds-mheat__cell--l2]="cell.level === 2"
              [class.ds-mheat__cell--l3]="cell.level >= 3"
              [class.ds-mheat__cell--today]="cell.isToday"
              [attr.aria-label]="cell.ariaLabel"
              >{{ cell.label }}</span
            >
          } @else {
            <span
              class="ds-mheat__cell ds-mheat__cell--blank"
              aria-hidden="true"
            ></span>
          }
        }
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-mheat {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-3);
      }
      .ds-mheat__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--ds-space-2);
      }
      .ds-mheat__title {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        text-transform: capitalize;
      }
      .ds-mheat__nav {
        appearance: none;
        width: 2.25rem;
        height: 2.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 50%;
        background: var(--ds-surface-inset);
        color: var(--ds-text);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .ds-mheat__nav:disabled {
        opacity: 0.35;
        cursor: default;
      }
      .ds-mheat__nav:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
      }
      .ds-mheat__grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: var(--ds-space-1-5);
      }
      .ds-mheat__weekday {
        text-align: center;
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        text-transform: uppercase;
        color: var(--ds-text-muted);
      }
      .ds-mheat__cell {
        box-sizing: border-box;
        height: 2.375rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ds-radius-lg);
        background: var(--ds-surface-inset);
        color: var(--ds-text-muted);
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-medium);
        font-variant-numeric: tabular-nums;
      }
      .ds-mheat__cell--blank {
        background: transparent;
      }
      .ds-mheat__cell--l1 {
        background: color-mix(in srgb, var(--ds-primary) 22%, transparent);
        color: var(--ds-text);
        font-weight: var(--ds-weight-bold);
      }
      .ds-mheat__cell--l2 {
        background: color-mix(in srgb, var(--ds-primary) 50%, transparent);
        color: var(--ds-text);
        font-weight: var(--ds-weight-bold);
      }
      .ds-mheat__cell--l3 {
        background: var(--ds-primary);
        color: var(--ds-on-primary);
        font-weight: var(--ds-weight-bold);
      }
      .ds-mheat__cell--today {
        box-shadow: inset 0 0 0 2px var(--ds-primary);
      }
    `,
  ],
})
export class MonthHeatmapComponent {
  @Input() title = "";
  @Input() weekdayLabels: string[] = [];
  @Input() cells: MonthHeatmapCell[] = [];
  @Input() previousLabel = "";
  @Input() nextLabel = "";
  @Input() canPrevious = true;
  @Input() canNext = true;

  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
}
