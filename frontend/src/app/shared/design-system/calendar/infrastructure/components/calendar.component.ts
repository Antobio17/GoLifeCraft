import { Component, EventEmitter, Input, Output } from "@angular/core";

export type CalendarDayStatus = "green" | "orange" | "red" | "rest" | "future";

export interface CalendarCell {
  key: string;
  day: number | null;
  date: string;
  status: CalendarDayStatus;
  isToday: boolean;
  isSelected: boolean;
  disabled: boolean;
}

export interface CalendarLegendItem {
  label: string;
  status: CalendarDayStatus;
}

@Component({
  selector: "ds-calendar",
  standalone: true,
  template: `
    <div class="ds-cal">
      <div class="ds-cal__nav">
        <button
          class="ds-cal__navbtn"
          type="button"
          [attr.aria-label]="previousLabel"
          (click)="previousMonth.emit()"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 6l-6 6 6 6"></path>
          </svg>
        </button>
        <span class="ds-cal__month">{{ monthLabel }}</span>
        <button
          class="ds-cal__navbtn"
          type="button"
          [attr.aria-label]="nextLabel"
          (click)="nextMonth.emit()"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 6l6 6-6 6"></path>
          </svg>
        </button>
      </div>

      <div class="ds-cal__weekdays">
        @for (weekday of weekdays; track $index) {
          <span class="ds-cal__weekday">{{ weekday }}</span>
        }
      </div>

      <div class="ds-cal__grid">
        @for (cell of cells; track cell.key) {
          @if (cell.day === null) {
            <span class="ds-cal__cell ds-cal__cell--blank"></span>
          } @else {
            <button
              class="ds-cal__cell"
              type="button"
              [class.ds-cal__cell--green]="cell.status === 'green'"
              [class.ds-cal__cell--orange]="cell.status === 'orange'"
              [class.ds-cal__cell--red]="cell.status === 'red'"
              [class.ds-cal__cell--rest]="cell.status === 'rest'"
              [class.ds-cal__cell--today]="cell.isToday"
              [class.ds-cal__cell--selected]="cell.isSelected"
              [disabled]="cell.disabled"
              (click)="daySelected.emit(cell.date)"
            >
              {{ cell.day }}
            </button>
          }
        }
      </div>

      @if (legend.length > 0) {
        <div class="ds-cal__legend">
          @for (item of legend; track item.status) {
            <span class="ds-cal__legend-item">
              <span
                class="ds-cal__swatch"
                [class.ds-cal__swatch--green]="item.status === 'green'"
                [class.ds-cal__swatch--orange]="item.status === 'orange'"
                [class.ds-cal__swatch--red]="item.status === 'red'"
                [class.ds-cal__swatch--rest]="item.status === 'rest'"
              ></span>
              <span class="ds-cal__legend-label">{{ item.label }}</span>
            </span>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-width: 0;
        --ds-cal-green: #3e7c57;
        --ds-cal-orange: #e0a83e;
        --ds-cal-red: #c0553b;
      }
      .ds-cal {
        width: 100%;
        min-width: 0;
      }
      .ds-cal__nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-width: 0;
        margin-bottom: 14px;
      }
      .ds-cal__navbtn {
        appearance: none;
        border: none;
        cursor: pointer;
        width: 34px;
        height: 34px;
        border-radius: 11px;
        background: var(--ds-surface-subtle);
        color: var(--ds-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
      }
      .ds-cal__navbtn:hover {
        color: var(--ds-text);
      }
      .ds-cal__month {
        flex: 1 1 auto;
        min-width: 0;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-bold);
        font-size: var(--ds-text-md);
        color: var(--ds-text);
      }
      .ds-cal__weekdays,
      .ds-cal__grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 6px;
        width: 100%;
        min-width: 0;
      }
      .ds-cal__weekdays {
        margin-bottom: 6px;
      }
      .ds-cal__weekday {
        text-align: center;
        font-size: 10.5px;
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text-disabled);
        letter-spacing: 0.04em;
      }
      .ds-cal__cell {
        appearance: none;
        border: 2px solid transparent;
        aspect-ratio: 1;
        width: 100%;
        min-width: 0;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: var(--ds-weight-semibold);
        background: transparent;
        color: var(--ds-text);
        cursor: pointer;
      }
      .ds-cal__cell:disabled {
        color: var(--ds-text-disabled);
        cursor: default;
      }
      .ds-cal__cell--blank {
        border: none;
        background: transparent;
        cursor: default;
      }
      .ds-cal__cell--rest {
        background: var(--ds-surface-subtle);
        color: var(--ds-text-muted);
      }
      .ds-cal__cell--green {
        background: var(--ds-cal-green);
        color: #fff;
      }
      .ds-cal__cell--orange {
        background: var(--ds-cal-orange);
        color: #fff;
      }
      .ds-cal__cell--red {
        background: var(--ds-cal-red);
        color: #fff;
      }
      .ds-cal__cell--today {
        font-weight: var(--ds-weight-bold);
        border-color: var(--ds-primary);
      }
      .ds-cal__cell--today.ds-cal__cell--green,
      .ds-cal__cell--today.ds-cal__cell--orange,
      .ds-cal__cell--today.ds-cal__cell--red {
        border-color: #ffffff;
      }
      .ds-cal__cell--selected {
        border-color: var(--ds-primary);
      }
      .ds-cal__legend {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 18px;
        padding-top: 16px;
        border-top: 1px solid var(--ds-border);
      }
      .ds-cal__legend-item {
        display: flex;
        align-items: center;
        gap: 7px;
      }
      .ds-cal__swatch {
        width: 11px;
        height: 11px;
        border-radius: 4px;
        flex: 0 0 auto;
        background: var(--ds-surface-subtle);
      }
      .ds-cal__swatch--green {
        background: var(--ds-cal-green);
      }
      .ds-cal__swatch--orange {
        background: var(--ds-cal-orange);
      }
      .ds-cal__swatch--red {
        background: var(--ds-cal-red);
      }
      .ds-cal__legend-label {
        font-size: 11.5px;
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
        overflow-wrap: anywhere;
      }
    `,
  ],
})
export class CalendarComponent {
  @Input() monthLabel = "";
  @Input() weekdays: string[] = [];
  @Input() cells: CalendarCell[] = [];
  @Input() legend: CalendarLegendItem[] = [];
  @Input() previousLabel = "Previous month";
  @Input() nextLabel = "Next month";

  @Output() previousMonth = new EventEmitter<void>();
  @Output() nextMonth = new EventEmitter<void>();
  @Output() daySelected = new EventEmitter<string>();
}
