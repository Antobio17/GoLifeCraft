import { NgTemplateOutlet } from "@angular/common";
import {
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { ViewportService } from "@shared/viewport/application/services/viewport.service";
import { WeekStripDay } from "../../domain/models/week-strip-day.model";
import { WeekStripDayState } from "../../domain/models/week-strip-day-state.enum";
import { WeekStripDayTone } from "../../domain/models/week-strip-day-tone.enum";
import { WeekStripDayView } from "../../domain/models/week-strip-day-view.model";

@Component({
  selector: "ds-week-strip",
  imports: [IconComponent, NgTemplateOutlet],
  host: {
    "[class.ds-week-host--frameless]": "frameless()",
    "[class.ds-week-host--collapsible]": "collapsible()",
  },
  template: `
    <section #week class="ds-week" [attr.aria-label]="title() || null">
      @if (title()) {
        <div #head class="ds-week__head">
          <div class="ds-week__text">
            <span class="ds-week__title">{{ title() }}</span>
            @if (caption()) {
              <span class="ds-week__caption">{{ caption() }}</span>
            }
          </div>
          @if (badgeLabel()) {
            <span class="ds-week__badge">
              <ds-icon name="flame" [size]="14" [stroke]="2.2" />
              {{ badgeLabel() }}
            </span>
          }
          <span class="ds-week__actions">
            <ng-content select="[slot=actions]" />
          </span>
        </div>
      }

      @if (navigable()) {
        <div class="ds-week__body">
          <button
            class="ds-week__nav"
            type="button"
            data-testid="week-strip-previous"
            [attr.aria-label]="previousLabel()"
            (click)="previousWeek.emit()"
          >
            <ds-icon name="chevronLeft" [size]="16" [stroke]="2.4" />
          </button>
          <ng-container [ngTemplateOutlet]="dayList" />
          <button
            class="ds-week__nav"
            type="button"
            data-testid="week-strip-next"
            [attr.aria-label]="nextLabel()"
            (click)="nextWeek.emit()"
          >
            <ds-icon name="chevronRight" [size]="16" [stroke]="2.4" />
          </button>
        </div>
      } @else {
        <ng-container [ngTemplateOutlet]="dayList" />
      }
    </section>

    <ng-template #dayList>
      <ol class="ds-week__days">
        @for (view of dayViews(); track view.day.key) {
          <li
            class="ds-week__day"
            [class.ds-week__day--in-range]="view.isInRange"
            [class.ds-week__day--range-start]="view.isRangeStart"
            [class.ds-week__day--range-end]="view.isRangeEnd"
            [attr.aria-label]="selectable() ? null : view.day.ariaLabel"
          >
            @if (selectable()) {
              <button
                class="ds-week__hit"
                type="button"
                [attr.data-date]="view.day.date"
                [attr.aria-label]="view.day.ariaLabel"
                [attr.aria-pressed]="view.isSelected || view.isInRange"
                [attr.aria-current]="
                  view.isToday || view.isTodayOnTone ? 'date' : null
                "
                (click)="daySelected.emit(view.day.date)"
                (keydown)="onDaysKeydown($event)"
              >
                <ng-container
                  [ngTemplateOutlet]="dayContent"
                  [ngTemplateOutletContext]="{ $implicit: view }"
                />
              </button>
            } @else {
              <ng-container
                [ngTemplateOutlet]="dayContent"
                [ngTemplateOutletContext]="{ $implicit: view }"
              />
            }
          </li>
        }
      </ol>
    </ng-template>

    <ng-template #dayContent let-view>
      <span class="ds-week__weekday" aria-hidden="true">
        {{ view.day.weekday }}
      </span>
      <span
        class="ds-week__dot"
        [class.ds-week__dot--done]="view.isDone"
        [class.ds-week__dot--today]="view.isToday"
        [class.ds-week__dot--neutral]="view.tone === tone.Neutral"
        [class.ds-week__dot--success]="view.tone === tone.Success"
        [class.ds-week__dot--warning]="view.tone === tone.Warning"
        [class.ds-week__dot--danger]="view.tone === tone.Danger"
        [class.ds-week__dot--planned]="view.tone === tone.Planned"
        [class.ds-week__dot--today-on-tone]="view.isTodayOnTone"
        [class.ds-week__dot--selected]="view.isSelected"
        aria-hidden="true"
      >
        {{ view.day.day }}
      </span>
    </ng-template>
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
        border-radius: var(--ds-radius-surface);
        box-shadow: var(--ds-shadow-card);
      }
      @media (max-width: 999.98px) {
        :host(.ds-week-host--collapsible) {
          position: sticky;
          top: calc(
            env(safe-area-inset-top) + var(--ds-sticky-header-offset, 0px) +
              var(--ds-space-2) - var(--week-collapse, 0px)
          );
          z-index: 15;
        }
        :host(.ds-week-host--collapsible) .ds-week {
          position: relative;
          isolation: isolate;
          background: none;
          border: none;
          box-shadow: none;
        }
        :host(.ds-week-host--collapsible) .ds-week::before {
          content: "";
          position: absolute;
          inset: var(--week-hidden, 0px) 0 0;
          z-index: -1;
          background: var(--ds-surface);
          border: 1px solid var(--ds-border);
          border-radius: var(--ds-radius-surface);
          box-shadow: var(--ds-shadow-card);
        }
        :host(.ds-week-host--collapsible) .ds-week__head {
          opacity: calc(1 - var(--week-progress, 0));
          clip-path: inset(var(--week-hidden, 0px) 0 0);
        }
      }
      :host(.ds-week-host--frameless) .ds-week {
        padding: 0;
        background: transparent;
        border: none;
        border-radius: 0;
        box-shadow: none;
      }
      .ds-week__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--ds-space-3);
      }
      .ds-week__actions {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: var(--ds-space-1);
      }
      .ds-week__actions:empty {
        display: none;
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
      .ds-week__body {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: end;
        gap: var(--ds-space-1-5);
      }
      .ds-week__nav {
        appearance: none;
        border: none;
        cursor: pointer;
        width: 2.125rem;
        height: 2.375rem;
        padding: 0;
        border-radius: var(--ds-radius-control);
        background: var(--ds-surface-subtle);
        color: var(--ds-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .ds-week__nav:hover {
        color: var(--ds-text);
      }
      .ds-week__nav:focus-visible {
        outline: none;
        box-shadow: var(--ds-focus-ring);
      }
      .ds-week__days {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: var(--ds-space-1-5);
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .ds-week__day,
      .ds-week__hit {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--ds-space-1-5);
      }
      .ds-week__hit {
        appearance: none;
        width: 100%;
        min-width: 0;
        padding: 0;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
        outline: none;
      }
      .ds-week__hit:focus-visible .ds-week__dot {
        box-shadow: var(--ds-focus-ring);
      }
      .ds-week__day--in-range {
        position: relative;
      }
      .ds-week__day--in-range::before {
        content: "";
        position: absolute;
        bottom: 0;
        left: calc(var(--ds-space-1-5) / -2);
        right: calc(var(--ds-space-1-5) / -2);
        height: 2.375rem;
        background: var(--ds-primary-soft);
      }
      .ds-week__day--range-start::before {
        left: 50%;
      }
      .ds-week__day--range-end::before {
        right: 50%;
      }
      .ds-week__day--in-range > * {
        position: relative;
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
      .ds-week__dot--success,
      .ds-week__dot--warning,
      .ds-week__dot--danger {
        font-weight: var(--ds-weight-bold);
      }
      .ds-week__dot--success {
        background: var(--ds-success-soft);
        color: var(--ds-success);
      }
      .ds-week__dot--warning {
        background: var(--ds-warning-soft);
        color: var(--ds-warning);
      }
      .ds-week__dot--danger {
        background: var(--ds-danger-soft);
        color: var(--ds-danger-soft-text);
      }
      .ds-week__dot--planned {
        background: transparent;
        border: 2px dashed var(--ds-border-strong);
      }
      .ds-week__dot--today-on-tone {
        border: 2px solid var(--ds-primary);
        color: var(--ds-primary);
        font-weight: var(--ds-weight-bold);
      }
      .ds-week__dot--success.ds-week__dot--today-on-tone {
        color: var(--ds-success);
      }
      .ds-week__dot--warning.ds-week__dot--today-on-tone {
        color: var(--ds-warning);
      }
      .ds-week__dot--danger.ds-week__dot--today-on-tone {
        color: var(--ds-danger-soft-text);
      }
      .ds-week__dot--selected {
        outline: 2px solid var(--ds-primary);
        outline-offset: 2px;
      }
    `,
  ],
})
export class WeekStripComponent {
  title = input("");
  caption = input("");
  badgeLabel = input("");
  days = input<WeekStripDay[]>([]);
  frameless = input(false);
  selectable = input(false);
  selected = input("");
  rangeStart = input("");
  rangeEnd = input("");
  navigable = input(false);
  collapsible = input(false);
  previousLabel = input("Previous week");
  nextLabel = input("Next week");

  daySelected = output<string>();
  previousWeek = output<void>();
  nextWeek = output<void>();

  protected readonly tone = WeekStripDayTone;

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly narrow = inject(ViewportService).matches(
    "(max-width: 999.98px)",
  );
  private readonly week = viewChild<ElementRef<HTMLElement>>("week");
  private readonly head = viewChild<ElementRef<HTMLElement>>("head");

  constructor() {
    effect((onCleanup) => {
      const week = this.week()?.nativeElement;
      const head = this.head()?.nativeElement;
      if (!this.collapsible() || !this.narrow() || !week || !head) {
        return;
      }

      onCleanup(this.followCollapse(week, head));
    });
  }

  protected readonly dayViews = computed<WeekStripDayView[]>(() => {
    const selected = this.selected();
    const from = this.rangeStart();
    const to = this.rangeEnd() || from;
    const hasRange = from !== "" && to !== "" && from !== to;

    return this.days().map((day) => {
      const tone = day.tone ?? null;
      const isToday = day.state === WeekStripDayState.Today;
      const isRangeStart = hasRange && day.date === from;
      const isRangeEnd = hasRange && day.date === to;
      const isEndpoint = from !== "" && (day.date === from || day.date === to);

      return {
        day,
        tone,
        isToday: tone === null && isToday,
        isDone: tone === null && day.state === WeekStripDayState.Done,
        isTodayOnTone: tone !== null && isToday,
        isSelected: day.date === selected || isEndpoint,
        isInRange: hasRange && day.date >= from && day.date <= to,
        isRangeStart,
        isRangeEnd,
      };
    });
  });

  private followCollapse(week: HTMLElement, head: HTMLElement): () => void {
    let collapse = 0;
    const update = () => {
      const stuckTop = parseFloat(getComputedStyle(this.host).top) || 0;
      const top = this.host.getBoundingClientRect().top;
      const hidden = Math.min(Math.max(stuckTop + collapse - top, 0), collapse);
      this.host.style.setProperty("--week-hidden", `${hidden}px`);
      this.host.style.setProperty(
        "--week-progress",
        `${collapse > 0 ? hidden / collapse : 0}`,
      );
    };
    const measure = () => {
      collapse =
        head.offsetHeight + (parseFloat(getComputedStyle(week).rowGap) || 0);
      this.host.style.setProperty("--week-collapse", `${collapse}px`);
      update();
    };
    const size = new ResizeObserver(measure);

    size.observe(head);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    return () => {
      size.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      this.host.style.removeProperty("--week-hidden");
      this.host.style.removeProperty("--week-collapse");
      this.host.style.removeProperty("--week-progress");
    };
  }

  protected onDaysKeydown(event: KeyboardEvent): void {
    const step = this.keyStep(event.key);
    if (step === null) {
      return;
    }

    const current = event.target as HTMLElement;
    const list = current.closest("ol");
    if (!list || !current.classList.contains("ds-week__hit")) {
      return;
    }

    const buttons = Array.from(
      list.querySelectorAll<HTMLButtonElement>(".ds-week__hit"),
    );
    const index = buttons.indexOf(current as HTMLButtonElement);
    const target = this.targetIndex(step, index, buttons.length);

    event.preventDefault();
    buttons[target]?.focus();
  }

  private keyStep(key: string): number | "first" | "last" | null {
    const steps: Record<string, number | "first" | "last"> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      Home: "first",
      End: "last",
    };

    return steps[key] ?? null;
  }

  private targetIndex(
    step: number | "first" | "last",
    index: number,
    total: number,
  ): number {
    if (step === "first") {
      return 0;
    }
    if (step === "last") {
      return total - 1;
    }

    return Math.min(Math.max(index + step, 0), total - 1);
  }
}
