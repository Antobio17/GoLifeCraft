import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { FieldComponent } from "@shared/design-system/field/infrastructure/components/field.component";
import { DateInputComponent } from "@shared/design-system/date-input/infrastructure/components/date-input.component";
import { NoteComponent } from "@shared/design-system/note/infrastructure/components/note.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { GetMenuService } from "@nutrition/menu/menu/application/services/get-menu.service";
import { LoadMenuService } from "@nutrition/menu/menu/application/services/load-menu.service";
import { MenuViewService } from "@nutrition/menu/menu/application/services/menu-view.service";
import {
  MenuDetailAttributes,
  MenuWeekDayKey,
} from "@nutrition/menu/menu/domain/models/menu.model";

const MODULE_PATH = "nutrition/menu/menu";

@Component({
  selector: "app-menu-load-sheet",
  standalone: true,
  imports: [
    FormsModule,
    ContextualTranslatePipe,
    ModalSheetComponent,
    StackComponent,
    CardComponent,
    EmojiTileComponent,
    TextComponent,
    FieldComponent,
    DateInputComponent,
    NoteComponent,
    ButtonComponent,
  ],
  template: `
    <ds-modal-sheet
      [open]="open()"
      [compact]="true"
      [title]="'getMenu.load.title' | t"
      [closeLabel]="'getMenu.close' | t"
      (closed)="close()"
    >
      <ds-stack [gap]="'14px'">
        <ds-text variant="meta">{{ "getMenu.load.subtitleDay" | t }}</ds-text>

        <ds-card [padding]="'12px 14px'">
          <ds-stack direction="row" align="center" [gap]="'12px'">
            <ds-emoji-tile [emoji]="emoji()" [size]="46" [radius]="13" />
            <ds-stack [gap]="'2px'" [grow]="true">
              <ds-text variant="strong" [truncate]="true">{{
                title()
              }}</ds-text>
              <ds-text variant="meta">{{ kcalLine() }}</ds-text>
            </ds-stack>
          </ds-stack>
        </ds-card>

        <ds-field [label]="'getMenu.load.day' | t">
          <ds-date-input
            [ngModel]="date()"
            [ngModelOptions]="{ standalone: true }"
            (ngModelChange)="onDate($event)"
          />
        </ds-field>

        <ds-note icon="info">{{ "getMenu.load.hintDay" | t }}</ds-note>

        <ds-button
          variant="primary"
          icon="download"
          [fullWidth]="true"
          [loading]="saving()"
          (clicked)="confirm()"
        >
          {{ "getMenu.load.confirmDay" | t }}
        </ds-button>
      </ds-stack>
    </ds-modal-sheet>
  `,
})
export class MenuLoadSheetComponent {
  private translationService = inject(TranslationService);
  private getMenuService = inject(GetMenuService);
  private loadMenuService = inject(LoadMenuService);
  private view = inject(MenuViewService);

  @Input() set menuId(value: string | null) {
    this.currentMenuId.set(value);

    if (!value) return;

    this.translationService
      .loadModuleTranslations(MODULE_PATH)
      .then(() => this.loadMenu(value));
  }

  @Input() dayKey: MenuWeekDayKey | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() loaded = new EventEmitter<void>();

  private currentMenuId = signal<string | null>(null);

  detail = signal<MenuDetailAttributes | null>(null);
  date = signal("");
  saving = signal(false);

  open = computed(() => this.currentMenuId() !== null);

  emoji = computed(() => this.detail()?.emoji ?? "🍽️");

  onDate(value: string): void {
    this.date.set(value);
  }

  title = computed(() => {
    const detail = this.detail();
    if (!detail) return "";
    if (!this.dayKey) return detail.name;

    return `${detail.name} · ${this.t(`getMenu.daysFull.${this.dayKey}`)}`;
  });

  kcalLine = computed(() => {
    const day = this.targetDay();
    const calories = day ? day.totals.calories : 0;

    return this.translationService.translate(
      "getMenu.load.kcalPerDay",
      MODULE_PATH,
      { kcal: this.view.integer(calories) },
    );
  });

  close(): void {
    this.currentMenuId.set(null);
    this.closed.emit();
  }

  confirm(): void {
    const menuId = this.currentMenuId();
    if (!menuId || this.saving()) return;

    this.saving.set(true);

    this.loadMenuService
      .loadMenu(menuId, {
        fromDate: this.date(),
        toDate: this.date(),
        dayKey: this.dayKey,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.loaded.emit();
          this.close();
        },
        error: () => this.saving.set(false),
      });
  }

  private targetDay() {
    const detail = this.detail();
    if (!detail) return null;

    return this.view.findDay(detail, this.dayKey);
  }

  private loadMenu(menuId: string): void {
    this.date.set(this.view.addDays(this.view.todayIso(), 1));

    this.getMenuService.getMenu(menuId).subscribe({
      next: (response) => this.detail.set(response.data.attributes),
    });
  }

  private t(key: string): string {
    return this.translationService.translate(key, MODULE_PATH);
  }
}
