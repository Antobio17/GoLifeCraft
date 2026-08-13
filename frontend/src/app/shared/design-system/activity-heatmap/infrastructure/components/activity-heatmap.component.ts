import {
  AfterViewChecked,
  Component,
  ElementRef,
  computed,
  input,
  viewChild,
} from "@angular/core";

export interface ActivityHeatmapCell {
  date: string;
  level: number;
  label: string;
  today: boolean;
  placeholder: boolean;
}

export interface ActivityHeatmapWeek {
  key: string;
  cells: ActivityHeatmapCell[];
}

export interface ActivityHeatmapMonth {
  key: string;
  label: string;
  column: number;
}

@Component({
  selector: "ds-activity-heatmap",
  template: `
    <div class="ds-heat">
      <div class="ds-heat__rows">
        @for (weekday of weekdayLabels(); track $index) {
          <span class="ds-heat__weekday">{{ weekday }}</span>
        }
      </div>

      <div #scroller class="ds-heat__scroll">
        <div class="ds-heat__canvas" [style.--ds-heat-columns]="columns()">
          <div class="ds-heat__months">
            @for (month of months(); track month.key) {
              <span class="ds-heat__month" [style.grid-column]="month.column">
                {{ month.label }}
              </span>
            }
          </div>

          <div class="ds-heat__grid">
            @for (week of weeks(); track week.key) {
              @for (cell of week.cells; track cell.date) {
                <span
                  class="ds-heat__cell"
                  [class.ds-heat__cell--empty]="cell.placeholder"
                  [class.ds-heat__cell--today]="cell.today"
                  [attr.data-level]="cell.level"
                  [title]="cell.label"
                ></span>
              }
            }
          </div>
        </div>
      </div>
    </div>

    @if (legendLess() || legendMore()) {
      <div class="ds-heat__legend">
        <span class="ds-heat__legend-text">{{ legendLess() }}</span>
        @for (level of legendLevels; track level) {
          <span class="ds-heat__cell" [attr.data-level]="level"></span>
        }
        <span class="ds-heat__legend-text">{{ legendMore() }}</span>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        --ds-heat-cell: 0.75rem;
        --ds-heat-gap: 0.1875rem;
      }
      .ds-heat {
        display: flex;
        gap: 0.375rem;
      }
      .ds-heat__rows {
        display: grid;
        grid-template-rows: repeat(7, var(--ds-heat-cell));
        gap: var(--ds-heat-gap);
        padding-top: calc(var(--ds-heat-cell) + var(--ds-heat-gap));
        flex: 0 0 auto;
      }
      .ds-heat__weekday {
        display: flex;
        align-items: center;
        font-size: 0.53125rem;
        line-height: 1;
        color: var(--ds-text-meta);
      }
      .ds-heat__scroll {
        min-width: 0;
        flex: 1 1 auto;
        overflow-x: auto;
        overflow-y: hidden;
        overscroll-behavior-x: contain;
        scrollbar-width: none;
      }
      .ds-heat__scroll::-webkit-scrollbar {
        display: none;
      }
      .ds-heat__canvas {
        display: flex;
        flex-direction: column;
        gap: var(--ds-heat-gap);
        width: max-content;
      }
      .ds-heat__months,
      .ds-heat__grid {
        display: grid;
        grid-template-columns: repeat(
          var(--ds-heat-columns),
          var(--ds-heat-cell)
        );
        gap: var(--ds-heat-gap);
      }
      .ds-heat__grid {
        grid-template-rows: repeat(7, var(--ds-heat-cell));
        grid-auto-flow: column;
      }
      .ds-heat__months {
        height: var(--ds-heat-cell);
      }
      .ds-heat__month {
        grid-row: 1;
        font-size: 0.53125rem;
        line-height: var(--ds-heat-cell);
        white-space: nowrap;
        color: var(--ds-text-meta);
      }
      .ds-heat__cell {
        width: var(--ds-heat-cell);
        height: var(--ds-heat-cell);
        border-radius: 0.1875rem;
        background: var(--ds-heat-level-0, var(--ds-border));
      }
      .ds-heat__cell[data-level="1"] {
        background: var(--ds-heat-level-1, var(--ds-primary-soft));
      }
      .ds-heat__cell[data-level="2"] {
        background: var(--ds-heat-level-2, var(--ds-primary-soft));
      }
      .ds-heat__cell[data-level="3"] {
        background: var(--ds-heat-level-3, var(--ds-primary));
      }
      .ds-heat__cell[data-level="4"] {
        background: var(--ds-heat-level-4, var(--ds-primary));
      }
      .ds-heat__cell--empty {
        background: transparent;
      }
      .ds-heat__cell--today {
        box-shadow: inset 0 0 0 1.5px var(--ds-heat-today, var(--ds-text-meta));
      }
      .ds-heat__cell--today[data-level="3"],
      .ds-heat__cell--today[data-level="4"] {
        box-shadow: inset 0 0 0 1.5px
          var(--ds-heat-today-strong, var(--ds-surface));
      }
      .ds-heat__legend {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.1875rem;
        margin-top: 0.625rem;
      }
      .ds-heat__legend-text {
        font-size: 0.53125rem;
        color: var(--ds-text-meta);
      }
      .ds-heat__legend-text:first-child {
        margin-right: 0.1875rem;
      }
      .ds-heat__legend-text:last-child {
        margin-left: 0.1875rem;
      }
    `,
  ],
})
export class ActivityHeatmapComponent implements AfterViewChecked {
  readonly weeks = input<ActivityHeatmapWeek[]>([]);
  readonly months = input<ActivityHeatmapMonth[]>([]);
  readonly weekdayLabels = input<string[]>([]);
  readonly legendLess = input("");
  readonly legendMore = input("");

  readonly legendLevels = [0, 1, 2, 3, 4];

  readonly columns = computed<number>(() => this.weeks().length);

  private readonly scroller = viewChild<ElementRef<HTMLElement>>("scroller");

  private scrolledTo = 0;

  ngAfterViewChecked(): void {
    const element = this.scroller()?.nativeElement;

    if (!element || element.scrollWidth === this.scrolledTo) {
      return;
    }

    this.scrolledTo = element.scrollWidth;
    element.scrollLeft = element.scrollWidth;
  }
}
