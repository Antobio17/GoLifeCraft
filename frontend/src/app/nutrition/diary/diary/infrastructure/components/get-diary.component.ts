import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { delay } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { PageWrapperComponent } from "@shared/design-system/page-wrapper/infrastructure/components/page-wrapper.component";
import { DiarySummaryComponent } from "@shared/design-system/diary-summary/infrastructure/components/diary-summary.component";
import { DiaryEntryComponent } from "@shared/design-system/diary-entry/infrastructure/components/diary-entry.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { HeadingComponent } from "@shared/design-system/heading/infrastructure/components/heading.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { PlaceholderNoteComponent } from "@shared/design-system/placeholder-note/infrastructure/components/placeholder-note.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { SearchInputComponent } from "@shared/design-system/search-input/infrastructure/components/search-input.component";
import { NutrientInputComponent } from "@shared/design-system/nutrient-input/infrastructure/components/nutrient-input.component";
import { NumberInputComponent } from "@shared/design-system/number-input/infrastructure/components/number-input.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import {
  SegmentedOption,
  SegmentedToggleComponent,
} from "@shared/design-system/segmented-toggle/infrastructure/components/segmented-toggle.component";
import { GetArticlesService } from "@nutrition/catalog/article/application/services/get-articles.service";
import { GetRecipesService } from "@nutrition/recipe/recipe/application/services/get-recipes.service";
import { GetDiaryService } from "@nutrition/diary/diary/application/services/get-diary.service";
import { DiaryViewService } from "@nutrition/diary/diary/application/services/diary-view.service";
import {
  DiaryChoice,
  DiaryPickerService,
} from "@nutrition/diary/diary/application/services/diary-picker.service";
import { CreateDiaryEntryService } from "@nutrition/diary/diary/application/services/create-diary-entry.service";
import { UpdateDiaryEntryService } from "@nutrition/diary/diary/application/services/update-diary-entry.service";
import { DeleteDiaryEntryService } from "@nutrition/diary/diary/application/services/delete-diary-entry.service";
import { DiaryDay } from "@nutrition/diary/diary/domain/models/diary.model";
import { GetDiaryGoalService } from "@nutrition/diary/goal/application/services/get-diary-goal.service";
import { UpdateDiaryGoalService } from "@nutrition/diary/goal/application/services/update-diary-goal.service";
import {
  DiaryGoalForm,
  DiaryGoalFormService,
} from "@nutrition/diary/goal/application/services/diary-goal-form.service";

type PickerTab = "product" | "recipe";

@Component({
  selector: "app-get-diary",
  templateUrl: "./get-diary.component.html",
  styleUrls: ["./get-diary.component.css"],
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    PageWrapperComponent,
    DiarySummaryComponent,
    DiaryEntryComponent,
    EmojiTileComponent,
    TextComponent,
    HeadingComponent,
    ButtonComponent,
    IconButtonComponent,
    PlaceholderNoteComponent,
    CardComponent,
    StackComponent,
    SkeletonComponent,
    ModalSheetComponent,
    SearchInputComponent,
    SegmentedToggleComponent,
    NutrientInputComponent,
    NumberInputComponent,
    NoteComponent,
    IconComponent,
  ],
})
export class GetDiaryComponent implements OnInit {
  private translationService = inject(TranslationService);
  private floatingToastService = inject(FloatingToastService);
  private authSession = inject(AuthSessionService);
  private getDiaryService = inject(GetDiaryService);
  private getArticlesService = inject(GetArticlesService);
  private getRecipesService = inject(GetRecipesService);
  private createDiaryEntryService = inject(CreateDiaryEntryService);
  private updateDiaryEntryService = inject(UpdateDiaryEntryService);
  private deleteDiaryEntryService = inject(DeleteDiaryEntryService);
  private getDiaryGoalService = inject(GetDiaryGoalService);
  private updateDiaryGoalService = inject(UpdateDiaryGoalService);
  protected goalForm = inject(DiaryGoalFormService);
  protected view = inject(DiaryViewService);
  protected picker = inject(DiaryPickerService);

  private readonly MODULE_PATH = "nutrition/diary/diary";
  private readonly SWIPE_THRESHOLD = 48;

  canWrite = this.authSession.isGod();

  loading = signal(true);
  day = signal<DiaryDay | null>(null);
  date = signal(this.view.todayIso());

  swipedEntryId = signal<string | null>(null);
  private swipeStartX = 0;
  private swipeStartY = 0;

  pickerOpen = signal(false);
  pickerMeal = signal("");
  pickerTab = signal<PickerTab>("product");
  pickerQuery = signal("");
  pickerTabs = signal<SegmentedOption[]>([]);

  attributes = computed(() => this.day()?.attributes ?? null);
  canGoNext = computed(() => !this.view.isToday(this.date()));
  titleKey = computed(() =>
    this.view.isToday(this.date()) ? "getDiary.titleToday" : "getDiary.title",
  );

  pickerChoices = computed<DiaryChoice[]>(() =>
    this.pickerTab() === "product"
      ? this.picker.productChoices(this.pickerQuery())
      : this.picker.recipeChoices(this.pickerQuery()),
  );

  pickerMealLabel = computed(() =>
    this.pickerMeal() ? this.mealLabel(this.pickerMeal()) : "",
  );

  goalSheetOpen = signal(false);
  goalLoading = signal(false);
  goalSaving = signal(false);
  goal = signal<DiaryGoalForm>({
    calories: 0,
    proteinPct: 0,
    fatPct: 0,
    carbsPct: 0,
  });

  goalProteinGrams = computed(() =>
    this.goalForm.grams(
      this.goal().calories,
      this.goal().proteinPct,
      "protein",
    ),
  );
  goalFatGrams = computed(() =>
    this.goalForm.grams(this.goal().calories, this.goal().fatPct, "fat"),
  );
  goalCarbsGrams = computed(() =>
    this.goalForm.grams(this.goal().calories, this.goal().carbsPct, "carbs"),
  );
  goalPercentTotal = computed(() => this.goalForm.percentTotal(this.goal()));
  goalValid = computed(() => this.goalForm.isValid(this.goal()));

  ngOnInit(): void {
    this.translationService
      .loadModuleTranslations(this.MODULE_PATH)
      .then(() => {
        this.pickerTabs.set([
          { value: "product", label: this.t("getDiary.picker.products") },
          { value: "recipe", label: this.t("getDiary.picker.recipes") },
        ]);
        this.loadChoices();
        this.load(this.date());
      });
  }

  t(key: string): string {
    return this.translationService.translate(key, this.MODULE_PATH);
  }

  badgeLabel(kind: string): string {
    return this.t(
      kind === "recipe" ? "getDiary.badge.recipe" : "getDiary.badge.product",
    );
  }

  mealLabel(key: string): string {
    return this.t(`getDiary.meals.${key}`);
  }

  previousDay(): void {
    this.load(this.view.addDays(this.date(), -1));
  }

  nextDay(): void {
    if (!this.canGoNext()) return;

    this.load(this.view.addDays(this.date(), 1));
  }

  goToday(): void {
    if (this.view.isToday(this.date())) return;

    this.load(this.view.todayIso());
  }

  openPicker(mealKey: string): void {
    this.pickerMeal.set(mealKey);
    this.pickerTab.set("product");
    this.pickerQuery.set("");
    this.pickerOpen.set(true);
  }

  closePicker(): void {
    this.pickerOpen.set(false);
  }

  onPickerTab(tab: string): void {
    this.pickerTab.set(tab as PickerTab);
    this.pickerQuery.set("");
  }

  onPickerSearch(query: string): void {
    this.pickerQuery.set(query);
  }

  onPick(choice: DiaryChoice): void {
    this.closePicker();

    this.createDiaryEntryService
      .createDiaryEntry({
        entryDate: this.date(),
        meal: this.pickerMeal(),
        kind: choice.kind,
        refId: choice.refId,
        quantity: choice.kind === "product" ? 100 : 1,
      })
      .subscribe({
        next: () => {
          this.toast("getDiary.toast.added");
          this.load(this.date());
        },
      });
  }

  onQuantityChange(entryId: string, quantity: number): void {
    if (!quantity || quantity <= 0) return;

    this.updateDiaryEntryService
      .updateDiaryEntryQuantity(entryId, quantity)
      .subscribe({ next: () => this.load(this.date()) });
  }

  isEntrySwiped(entryId: string): boolean {
    return this.swipedEntryId() === entryId;
  }

  onEntryTouchStart(event: TouchEvent, entryId: string): void {
    if (this.swipedEntryId() !== entryId) {
      this.swipedEntryId.set(null);
    }
    this.swipeStartX = event.touches[0].clientX;
    this.swipeStartY = event.touches[0].clientY;
  }

  onEntryTouchEnd(event: TouchEvent, entryId: string): void {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.swipeStartX;
    const deltaY = Math.abs(touch.clientY - this.swipeStartY);

    if (deltaY > Math.abs(deltaX)) return;

    if (deltaX < -this.SWIPE_THRESHOLD) {
      this.swipedEntryId.set(this.swipedEntryId() === entryId ? null : entryId);
      return;
    }

    if (deltaX > this.SWIPE_THRESHOLD / 2) {
      this.swipedEntryId.set(null);
    }
  }

  onRemove(entryId: string): void {
    this.swipedEntryId.set(null);
    this.deleteDiaryEntryService.deleteDiaryEntry(entryId).subscribe({
      next: () => {
        this.toast("getDiary.toast.removed");
        this.load(this.date());
      },
    });
  }

  openGoalSheet(): void {
    this.goalLoading.set(true);
    this.goalSheetOpen.set(true);

    this.getDiaryGoalService.getDiaryGoal().subscribe({
      next: (response) => {
        this.goal.set(this.goalForm.toForm(response.data.attributes));
        this.goalLoading.set(false);
      },
      error: () => this.goalLoading.set(false),
    });
  }

  closeGoalSheet(): void {
    this.goalSheetOpen.set(false);
  }

  onGoalCalories(calories: number): void {
    this.goal.update((form) => ({ ...form, calories: Math.max(0, calories) }));
  }

  onGoalProtein(percent: number): void {
    this.goal.update((form) => ({
      ...form,
      proteinPct: this.clampPercent(percent),
    }));
  }

  onGoalFat(percent: number): void {
    this.goal.update((form) => ({
      ...form,
      fatPct: this.clampPercent(percent),
    }));
  }

  onGoalCarbs(percent: number): void {
    this.goal.update((form) => ({
      ...form,
      carbsPct: this.clampPercent(percent),
    }));
  }

  saveGoals(): void {
    if (!this.goalValid() || this.goalSaving()) return;

    this.goalSaving.set(true);

    this.updateDiaryGoalService
      .updateDiaryGoal(this.goalForm.toConfig(this.goal()))
      .pipe(delay(600))
      .subscribe({
        next: () => {
          this.goalSaving.set(false);
          this.goalSheetOpen.set(false);
          this.toast("getDiary.goal.toast.saved");
          this.load(this.date());
        },
        error: () => this.goalSaving.set(false),
      });
  }

  private clampPercent(percent: number): number {
    return Math.min(100, Math.max(0, Math.round(percent)));
  }

  private loadChoices(): void {
    this.getArticlesService.getArticles(1, 200).subscribe({
      next: (response) => this.picker.setProducts(response.data),
    });
    this.getRecipesService.getRecipes(1, 200).subscribe({
      next: (response) => this.picker.setRecipes(response.data),
    });
  }

  private load(date: string): void {
    this.date.set(date);
    this.loading.set(true);

    this.getDiaryService.getDiary(date).subscribe({
      next: (response) => {
        this.day.set(response.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private toast(keyTranslation: string): void {
    this.floatingToastService.showToast({
      status: 200,
      keyTranslation,
      details: [],
    });
  }
}
