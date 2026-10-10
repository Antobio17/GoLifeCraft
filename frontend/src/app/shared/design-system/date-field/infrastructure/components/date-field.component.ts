import {
  Component,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { CalendarComponent } from "@shared/design-system/calendar/infrastructure/components/calendar.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { WeekStripComponent } from "@shared/design-system/week-strip/infrastructure/components/week-strip.component";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { DateFieldCalendarService } from "../../application/services/date-field-calendar.service";
import { DateFieldFormatService } from "../../application/services/date-field-format.service";

@Component({
  selector: "ds-date-field",
  imports: [
    CalendarComponent,
    IconComponent,
    ModalSheetComponent,
    WeekStripComponent,
    ContextualTranslatePipe,
  ],
  providers: [
    DateFieldFormatService,
    DateFieldCalendarService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateFieldComponent),
      multi: true,
    },
  ],
  template: `
    <button
      class="ds-date-field"
      type="button"
      aria-haspopup="dialog"
      [class.ds-date-field--empty]="!value()"
      [disabled]="disabled()"
      [attr.aria-expanded]="open()"
      [attr.aria-label]="triggerAriaLabel()"
      (click)="openSheet()"
    >
      <ds-icon
        class="ds-date-field__icon"
        name="calendar"
        [size]="18"
        [stroke]="2.1"
      />
      <span class="ds-date-field__label">
        {{ label() || placeholder() || ("dateField.placeholder" | t) }}
      </span>
      <ds-icon
        class="ds-date-field__chevron"
        name="chevronDown"
        [size]="16"
        [stroke]="2.3"
      />
    </button>

    <ds-modal-sheet
      [open]="open()"
      [title]="sheetTitle() || ariaLabel() || ('dateField.title' | t)"
      [closeLabel]="'dateField.close' | t"
      (closed)="closeSheet()"
    >
      <div class="ds-date-field__sheet">
        @if (week()) {
          <ds-week-strip
            data-testid="date-field-week"
            [title]="'dateField.thisWeek' | t"
            [frameless]="true"
            [selectable]="true"
            [selected]="value()"
            [days]="weekDays()"
            (daySelected)="pick($event)"
          />
        }
        <ds-calendar
          data-testid="date-field-calendar"
          [monthLabel]="monthLabel()"
          [weekdays]="weekdays"
          [cells]="cells()"
          [previousLabel]="'dateField.previousMonth' | t"
          [nextLabel]="'dateField.nextMonth' | t"
          (previousMonth)="shiftMonth(-1)"
          (nextMonth)="shiftMonth(1)"
          (daySelected)="pick($event)"
        />
      </div>
    </ds-modal-sheet>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-width: 0;
      }
      .ds-date-field {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        width: 100%;
        min-width: 0;
        min-height: 2.875rem;
        box-sizing: border-box;
        appearance: none;
        margin: 0;
        padding: var(--ds-space-2) var(--ds-space-3);
        border: 1px solid var(--ds-border-input);
        border-radius: var(--ds-radius-control);
        background: var(--ds-surface-inset);
        color: var(--ds-text);
        font: inherit;
        font-family: var(--ds-font-body);
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        text-align: left;
        cursor: pointer;
        outline: none;
        transition:
          border-color var(--ds-transition-fast),
          box-shadow var(--ds-transition-fast);
      }
      .ds-date-field:focus-visible {
        border-color: var(--ds-border-focus);
        box-shadow: var(--ds-focus-ring);
      }
      .ds-date-field:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
      .ds-date-field__icon {
        flex: 0 0 auto;
        color: var(--ds-primary);
      }
      .ds-date-field__label {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-date-field--empty .ds-date-field__label {
        color: var(--ds-text-muted);
        font-weight: var(--ds-weight-semibold);
      }
      .ds-date-field__chevron {
        flex: 0 0 auto;
        color: var(--ds-text-muted);
      }
      .ds-date-field__sheet {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-4);
        min-width: 0;
      }
    `,
  ],
})
export class DateFieldComponent implements ControlValueAccessor {
  private calendar = inject(DateFieldCalendarService);
  private format = inject(DateFieldFormatService);

  min = input("");
  max = input("");
  ariaLabel = input("");
  placeholder = input("");
  sheetTitle = input("");
  week = input(false);

  protected readonly value = signal("");
  protected readonly disabled = signal(false);
  protected readonly open = signal(false);
  private readonly month = signal("");
  private readonly today = signal(this.calendar.todayIso());

  protected readonly weekdays = this.calendar.weekdays();

  protected readonly label = computed(() =>
    this.format.shortLabel(this.value(), this.today()),
  );

  protected readonly triggerAriaLabel = computed(() => {
    const name = this.ariaLabel();
    const date = this.value() ? this.format.longLabel(this.value()) : "";

    return [name, date].filter(Boolean).join(": ") || null;
  });

  protected readonly monthLabel = computed(() =>
    this.format.monthLabel(this.month()),
  );

  protected readonly cells = computed(() =>
    this.calendar.cells(
      this.month(),
      this.value(),
      this.today(),
      this.min(),
      this.max(),
    ),
  );

  protected readonly weekDays = computed(() =>
    this.calendar.weekDays(this.today(), this.today()),
  );

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set((value ?? "").slice(0, 10));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);

    if (!isDisabled) {
      return;
    }

    this.open.set(false);
  }

  protected openSheet(): void {
    if (this.disabled()) {
      return;
    }

    const today = this.calendar.todayIso();
    const anchor =
      this.value() || this.calendar.clamp(today, this.min(), this.max());

    this.today.set(today);
    this.month.set(this.calendar.monthOf(anchor));
    this.open.set(true);
  }

  protected closeSheet(): void {
    this.open.set(false);
    this.onTouched();
  }

  protected shiftMonth(offset: number): void {
    this.month.update((month) => this.calendar.shiftMonth(month, offset));
  }

  protected pick(date: string): void {
    if (this.disabled() || !date) {
      return;
    }

    if (!this.calendar.isAllowed(date, this.min(), this.max())) {
      return;
    }

    this.value.set(date);
    this.onChange(date);
    this.closeSheet();
  }
}
