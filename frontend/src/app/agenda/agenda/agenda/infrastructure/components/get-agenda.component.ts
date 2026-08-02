import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Observable } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { SkeletonListComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-list.component";
import { EmptyStateComponent } from "@shared/design-system/empty-state/infrastructure/components/empty-state.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { TextInputComponent } from "@shared/design-system/text-input/infrastructure/components/text-input.component";
import { TextareaComponent } from "@shared/design-system/textarea/infrastructure/components/textarea.component";
import { DateInputComponent } from "@shared/design-system/date-input/infrastructure/components/date-input.component";
import { AgendaItemComponent } from "@shared/design-system/agenda-item/infrastructure/components/agenda-item.component";
import {
  ChoiceChipOption,
  ChoiceChipsComponent,
} from "@shared/design-system/choice-chips/infrastructure/components/choice-chips.component";
import {
  CalendarCell,
  CalendarComponent,
} from "@shared/design-system/calendar/infrastructure/components/calendar.component";
import { GetAgendaDayService } from "@agenda/agenda/agenda/application/services/get-agenda-day.service";
import { GetAgendaCalendarService } from "@agenda/agenda/agenda/application/services/get-agenda-calendar.service";
import { CreateAgendaEntryService } from "@agenda/agenda/agenda/application/services/create-agenda-entry.service";
import { CreateAgendaEntrySeriesService } from "@agenda/agenda/agenda/application/services/create-agenda-entry-series.service";
import { UpdateAgendaEntryService } from "@agenda/agenda/agenda/application/services/update-agenda-entry.service";
import { UpdateAgendaEntrySeriesService } from "@agenda/agenda/agenda/application/services/update-agenda-entry-series.service";
import { GetAgendaSeriesService } from "@agenda/agenda/agenda/application/services/get-agenda-series.service";
import { ChangeAgendaEntryStatusService } from "@agenda/agenda/agenda/application/services/change-agenda-entry-status.service";
import { DeleteAgendaEntryService } from "@agenda/agenda/agenda/application/services/delete-agenda-entry.service";
import { DeleteAgendaEntrySeriesService } from "@agenda/agenda/agenda/application/services/delete-agenda-entry-series.service";
import { AgendaViewService } from "@agenda/agenda/agenda/application/services/agenda-view.service";
import { AgendaCalendarViewService } from "@agenda/agenda/agenda/application/services/agenda-calendar-view.service";
import { AgendaCategoryCatalogService } from "@agenda/agenda/agenda/application/services/agenda-category-catalog.service";
import {
  AgendaEntryForm,
  AgendaEntryFormService,
} from "@agenda/agenda/agenda/application/services/agenda-entry-form.service";
import {
  AgendaDayAttributes,
  AgendaEntryDateMode,
  AgendaEntryKind,
  AgendaEntryView,
} from "@agenda/agenda/agenda/domain/models/agenda.model";
import { AgendaCalendarDay } from "@agenda/agenda/agenda/domain/models/agenda-calendar.model";

@Component({
  selector: "app-get-agenda",
  templateUrl: "./get-agenda.component.html",
  styleUrls: ["./get-agenda.component.css"],
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    StackComponent,
    TextComponent,
    HeadingComponent,
    ButtonComponent,
    IconButtonComponent,
    CardComponent,
    SkeletonListComponent,
    EmptyStateComponent,
    ModalSheetComponent,
    NoteComponent,
    TextInputComponent,
    TextareaComponent,
    DateInputComponent,
    AgendaItemComponent,
    ChoiceChipsComponent,
    CalendarComponent,
  ],
})
export class GetAgendaComponent implements OnInit {
  private translationService = inject(TranslationService);
  private authSession = inject(AuthSessionService);
  private getAgendaDayService = inject(GetAgendaDayService);
  private getAgendaCalendarService = inject(GetAgendaCalendarService);
  private createAgendaEntryService = inject(CreateAgendaEntryService);
  private createAgendaEntrySeriesService = inject(
    CreateAgendaEntrySeriesService,
  );
  private updateAgendaEntryService = inject(UpdateAgendaEntryService);
  private updateAgendaEntrySeriesService = inject(
    UpdateAgendaEntrySeriesService,
  );
  private getAgendaSeriesService = inject(GetAgendaSeriesService);
  private changeAgendaEntryStatusService = inject(
    ChangeAgendaEntryStatusService,
  );
  private deleteAgendaEntryService = inject(DeleteAgendaEntryService);
  private deleteAgendaEntrySeriesService = inject(
    DeleteAgendaEntrySeriesService,
  );
  protected view = inject(AgendaViewService);
  protected calendarView = inject(AgendaCalendarViewService);
  protected categoryCatalog = inject(AgendaCategoryCatalogService);
  protected entryForm = inject(AgendaEntryFormService);

  private readonly MODULE_PATH = "agenda/agenda/agenda";

  canWrite = computed(() => this.authSession.isGod());

  loading = signal(true);
  day = signal<AgendaDayAttributes | null>(null);
  date = signal(this.view.todayIso());

  calendarMonth = signal(this.calendarView.monthOf(this.view.todayIso()));
  calendarDays = signal<AgendaCalendarDay[]>([]);

  sheetOpen = signal(false);
  saving = signal(false);
  loadingSeries = signal(false);
  editingId = signal<string | null>(null);
  editingSeriesId = signal<string | null>(null);
  form = signal<AgendaEntryForm>(this.entryForm.empty(this.view.todayIso()));

  translationsReady = signal(false);

  entries = computed(() => this.day()?.entries ?? []);
  hasEntries = computed(() => this.entries().length > 0);

  calendarMonthLabel = computed(() =>
    this.calendarView.monthLabel(this.calendarMonth()),
  );
  calendarWeekdays = computed(() => this.calendarView.weekdays());
  calendarCells = computed<CalendarCell[]>(() =>
    this.calendarView.buildCells(
      this.calendarMonth(),
      this.calendarDays(),
      this.date(),
      this.view.todayIso(),
    ),
  );

  dayTitle = computed(() => {
    this.translationsReady();
    const relation = this.view.relation(this.date());

    return relation === "other"
      ? this.view.dayShort(this.date())
      : this.t(`getAgenda.day.${relation}`);
  });
  dayLabel = computed(() => this.view.dayLong(this.date()));
  countLabel = computed(() => {
    this.translationsReady();
    const attributes = this.day();
    if (!attributes || attributes.entryCount === 0)
      return this.t("getAgenda.count.empty");

    if (attributes.pendingCount === 0) return this.t("getAgenda.count.allDone");

    return attributes.pendingCount === 1
      ? this.t("getAgenda.count.one")
      : `${attributes.pendingCount} ${this.t("getAgenda.count.many")}`;
  });
  navLabel = computed(() => {
    this.translationsReady();

    return this.view.isToday(this.date())
      ? this.t("getAgenda.day.today")
      : this.view.dayShort(this.date());
  });

  sheetTitle = computed(() =>
    this.editingId() ? "getAgenda.sheet.editTitle" : "getAgenda.sheet.newTitle",
  );
  kindOptions = computed<ChoiceChipOption[]>(() => {
    this.translationsReady();

    return [
      { value: "task", label: this.t("getAgenda.kind.task") },
      { value: "appointment", label: this.t("getAgenda.kind.appointment") },
    ];
  });
  dateModeOptions = computed<ChoiceChipOption[]>(() => {
    this.translationsReady();

    return [
      { value: "single", label: this.t("getAgenda.sheet.dateMode.single") },
      { value: "range", label: this.t("getAgenda.sheet.dateMode.range") },
    ];
  });
  categoryOptions = computed<ChoiceChipOption[]>(() =>
    this.categoryCatalog.options(this.form().kind),
  );
  isRange = computed(() => this.entryForm.isRange(this.form()));
  isEditingRange = computed(() => this.editingSeriesId() !== null);
  startDateLabel = computed(() =>
    this.isRange()
      ? "getAgenda.sheet.startDateLabel"
      : "getAgenda.sheet.dateLabel",
  );
  sheetHint = computed(() => {
    if (this.isEditingRange()) return "getAgenda.sheet.rangeEditHint";

    return this.isRange()
      ? "getAgenda.sheet.rangeHint"
      : "getAgenda.sheet.hint";
  });
  categoryLabel = computed(() =>
    this.form().kind === "appointment"
      ? "getAgenda.sheet.appointmentTypes"
      : "getAgenda.sheet.taskTypes",
  );
  formValid = computed(() => {
    if (!this.entryForm.isValid(this.form())) return false;

    if (!this.isEditingRange()) return true;

    return this.entryForm.hasSeveralDays(this.form());
  });

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.translationsReady.set(true);
        this.load(this.date());
        this.loadCalendar();
      });
  }

  t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  entryKindLabel(entry: AgendaEntryView): string {
    return this.categoryCatalog.badgeLabel(
      entry.kind,
      entry.category,
      this.t(`getAgenda.kind.${entry.kind}`),
    );
  }

  previousDay(): void {
    this.selectDate(this.view.addDays(this.date(), -1));
  }

  nextDay(): void {
    this.selectDate(this.view.addDays(this.date(), 1));
  }

  goToday(): void {
    if (this.view.isToday(this.date())) return;

    this.selectDate(this.view.todayIso());
  }

  onCalendarDay(date: string): void {
    this.selectDate(date);
  }

  previousMonth(): void {
    this.calendarMonth.set(
      this.calendarView.shiftMonth(this.calendarMonth(), -1),
    );
    this.loadCalendar();
  }

  nextMonth(): void {
    this.calendarMonth.set(
      this.calendarView.shiftMonth(this.calendarMonth(), 1),
    );
    this.loadCalendar();
  }

  openNewSheet(): void {
    if (!this.canWrite()) return;

    this.editingId.set(null);
    this.editingSeriesId.set(null);
    this.form.set(this.entryForm.empty(this.date()));
    this.sheetOpen.set(true);
  }

  openEditSheet(entry: AgendaEntryView): void {
    if (!this.canWrite()) return;

    this.editingId.set(entry.id);
    this.editingSeriesId.set(entry.seriesId);
    this.sheetOpen.set(true);

    if (!entry.seriesId) {
      this.form.set(this.entryForm.fromEntry(entry));

      return;
    }

    this.form.set(this.entryForm.fromSeriesEntry(entry));
    this.loadSeriesIntoForm(entry.seriesId);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
    this.saving.set(false);
    this.loadingSeries.set(false);
  }

  onKind(kind: string): void {
    this.form.update((form) =>
      this.entryForm.withKind(form, kind as AgendaEntryKind),
    );
  }

  onDateMode(dateMode: string): void {
    this.form.update((form) =>
      this.entryForm.withDateMode(form, dateMode as AgendaEntryDateMode),
    );
  }

  onCategory(category: string): void {
    this.form.update((form) => ({
      ...form,
      category: form.category === category ? "" : category,
    }));
  }

  onField(field: keyof AgendaEntryForm, value: string): void {
    this.form.update((form) => this.entryForm.withField(form, field, value));
  }

  save(): void {
    if (!this.formValid() || this.saving()) return;

    const form = this.form();
    const request$ = this.buildSaveRequest(form);

    this.saving.set(true);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.sheetOpen.set(false);
        this.selectDate(form.entryDate);
      },
      error: () => this.saving.set(false),
    });
  }

  toggleEntry(entry: AgendaEntryView): void {
    if (!this.canWrite()) return;

    const previousDay = this.day();
    const previousCalendarDays = this.calendarDays();
    const done = !entry.done;

    this.day.update((day) =>
      day ? this.view.withToggledEntry(day, entry.id, done) : day,
    );
    this.calendarDays.update((days) =>
      this.calendarView.withToggledEntry(days, entry.entryDate, done),
    );

    this.changeAgendaEntryStatusService
      .changeAgendaEntryStatus(entry.id, done)
      .subscribe({
        error: () => {
          this.day.set(previousDay);
          this.calendarDays.set(previousCalendarDays);
        },
      });
  }

  removeEntry(entry: AgendaEntryView): void {
    if (!this.canWrite()) return;

    const request$ = entry.seriesId
      ? this.deleteAgendaEntrySeriesService.deleteAgendaEntrySeries(
          entry.seriesId,
        )
      : this.deleteAgendaEntryService.deleteAgendaEntry(entry.id);

    request$.subscribe({
      next: () => this.reload(),
    });
  }

  private loadSeriesIntoForm(seriesId: string): void {
    this.loadingSeries.set(true);

    this.getAgendaSeriesService.getAgendaSeries(seriesId).subscribe({
      next: (response) => {
        this.loadingSeries.set(false);
        this.form.set(this.entryForm.fromSeries(response.data.attributes));
      },
      error: () => this.loadingSeries.set(false),
    });
  }

  private buildSaveRequest(form: AgendaEntryForm): Observable<void> {
    const seriesId = this.editingSeriesId();

    if (seriesId) {
      return this.updateAgendaEntrySeriesService.updateAgendaEntrySeries(
        seriesId,
        this.entryForm.toSeriesPayload(form),
      );
    }

    const editingId = this.editingId();

    if (editingId) {
      return this.updateAgendaEntryService.updateAgendaEntry(
        editingId,
        this.entryForm.toPayload(form),
      );
    }

    if (this.entryForm.isRange(form)) {
      return this.createAgendaEntrySeriesService.createAgendaEntrySeries(
        this.entryForm.toSeriesPayload(form),
      );
    }

    return this.createAgendaEntryService.createAgendaEntry(
      this.entryForm.toPayload(form),
    );
  }

  private selectDate(date: string): void {
    this.calendarMonth.set(this.calendarView.monthOf(date));
    this.load(date);
    this.loadCalendar();
  }

  private reload(): void {
    this.load(this.date(), true);
    this.loadCalendar();
  }

  private load(date: string, silent = false): void {
    this.date.set(date);
    if (!silent) this.loading.set(true);

    this.getAgendaDayService.getAgendaDay(date).subscribe({
      next: (response) => {
        this.day.set(response.data.attributes);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadCalendar(): void {
    this.getAgendaCalendarService
      .getAgendaCalendar(this.calendarMonth())
      .subscribe({
        next: (response) =>
          this.calendarDays.set(response.data.attributes.days),
      });
  }
}
