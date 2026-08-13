import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  signal,
} from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ModalSheetComponent } from "@shared/design-system/modal-sheet/infrastructure/components/modal-sheet.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { CardComponent } from "@shared/design-system/card/infrastructure/components/card.component";
import { EmojiTileComponent } from "@shared/design-system/emoji-tile/infrastructure/components/emoji-tile.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { ButtonComponent } from "@shared/design-system/button/infrastructure/components/button.component";
import { GetMenuService } from "@nutrition/menu/menu/application/services/get-menu.service";
import { ApplyWeekMenuService } from "@nutrition/menu/menu/application/services/apply-week-menu.service";
import { MenuViewService } from "@nutrition/menu/menu/application/services/menu-view.service";
import {
  MenuDetailAttributes,
  MenuWeekDayKey,
} from "@nutrition/menu/menu/domain/models/menu.model";

interface ApplyWeekRow {
  dayKey: MenuWeekDayKey;
  dayLabel: string;
  dateLabel: string;
  kcalLabel: string;
  active: boolean;
}

const MODULE_PATH = "nutrition/menu/menu";

@Component({
  selector: "app-menu-apply-week-sheet",
  imports: [
    ContextualTranslatePipe,
    ModalSheetComponent,
    StackComponent,
    CardComponent,
    EmojiTileComponent,
    TextComponent,
    IconComponent,
    ButtonComponent,
  ],
  template: `
    <ds-modal-sheet
      [open]="open()"
      [compact]="true"
      [title]="'getMenu.applyWeek.title' | t"
      [closeLabel]="'getMenu.close' | t"
      (closed)="close()"
    >
      <ds-stack [gap]="'0.875rem'">
        <ds-text variant="meta">{{ weekLabel() }}</ds-text>

        <ds-card [padding]="'0.75rem 0.875rem'">
          <ds-stack direction="row" align="center" [gap]="'0.75rem'">
            <ds-emoji-tile [emoji]="emoji()" [size]="46" [radius]="13" />
            <ds-stack [gap]="'2px'" [grow]="true">
              <ds-text variant="strong" [truncate]="true">{{ name() }}</ds-text>
              <ds-text variant="meta">{{
                "getMenu.applyWeek.hint" | t
              }}</ds-text>
            </ds-stack>
          </ds-stack>
        </ds-card>

        <ds-stack [gap]="'0.4375rem'">
          @for (row of rows(); track row.dayKey) {
            <ds-card variant="inset" [padding]="'0.625rem 0.75rem'">
              <ds-stack direction="row" align="center" [gap]="'0.6875rem'">
                <ds-icon
                  class="applyweek__dot"
                  [class.applyweek__dot--off]="!row.active"
                  name="dot"
                  [size]="8"
                />
                <ds-stack [gap]="'1px'" [grow]="true">
                  <ds-text variant="strong">{{ row.dayLabel }}</ds-text>
                  <ds-text variant="meta">{{ row.dateLabel }}</ds-text>
                </ds-stack>
                <ds-text variant="strong">{{ row.kcalLabel }}</ds-text>
              </ds-stack>
            </ds-card>
          }
        </ds-stack>

        <ds-button
          variant="primary"
          icon="calendar"
          [fullWidth]="true"
          [disabled]="activeCount() === 0"
          [loading]="saving()"
          (clicked)="confirm()"
        >
          {{ confirmLabel() }}
        </ds-button>
      </ds-stack>
    </ds-modal-sheet>
  `,
  styles: [
    `
      .applyweek__dot {
        color: var(--ds-primary);
      }
      .applyweek__dot--off {
        color: var(--ds-border-strong);
      }
    `,
  ],
})
export class MenuApplyWeekSheetComponent {
  private translationService = inject(TranslationService);
  private getMenuService = inject(GetMenuService);
  private applyWeekMenuService = inject(ApplyWeekMenuService);
  private view = inject(MenuViewService);

  @Input() set menuId(value: string | null) {
    this.currentMenuId.set(value);

    if (!value) return;

    this.translationService
      .loadModuleTranslations(MODULE_PATH)
      .then(() => this.loadMenu(value));
  }

  @Output() closed = new EventEmitter<void>();
  @Output() applied = new EventEmitter<void>();

  private currentMenuId = signal<string | null>(null);

  detail = signal<MenuDetailAttributes | null>(null);
  weekStart = signal(this.view.nextMondayIso());
  saving = signal(false);

  open = computed(() => this.currentMenuId() !== null);
  emoji = computed(() => this.detail()?.emoji ?? "🗓️");
  name = computed(() => this.detail()?.name ?? "");

  weekLabel = computed(() =>
    this.translationService.translate(
      "getMenu.applyWeek.subtitle",
      MODULE_PATH,
      {
        from: this.view.dayShortLabel(this.weekStart()),
        to: this.view.dayShortLabel(this.view.addDays(this.weekStart(), 6)),
      },
    ),
  );

  rows = computed<ApplyWeekRow[]>(() => {
    const detail = this.detail();
    if (!detail) return [];

    return this.view.weekDayKeys().map((dayKey) => {
      const day = this.view.findDay(detail, dayKey);
      const active = (day?.itemCount ?? 0) > 0;

      return {
        dayKey,
        dayLabel: this.t(`getMenu.daysFull.${dayKey}`),
        dateLabel: this.view.dayShortLabel(
          this.view.weekDateIso(this.weekStart(), dayKey),
        ),
        kcalLabel: active
          ? `${this.view.integer(day?.totals.calories)} ${this.t("getMenu.kcal")}`
          : this.t("getMenu.applyWeek.empty"),
        active,
      };
    });
  });

  activeCount = computed(() => this.rows().filter((row) => row.active).length);

  confirmLabel = computed(() => {
    const count = this.activeCount();
    const days =
      count === 1
        ? this.t("getMenu.applyWeek.days.one")
        : this.translationService.translate(
            "getMenu.applyWeek.days.many",
            MODULE_PATH,
            { count },
          );

    return this.translationService.translate(
      "getMenu.applyWeek.confirm",
      MODULE_PATH,
      { days },
    );
  });

  close(): void {
    this.currentMenuId.set(null);
    this.closed.emit();
  }

  confirm(): void {
    const menuId = this.currentMenuId();
    if (!menuId || this.saving() || this.activeCount() === 0) return;

    this.saving.set(true);

    this.applyWeekMenuService
      .applyWeekMenu(menuId, { weekStartDate: this.weekStart() })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.applied.emit();
          this.close();
        },
        error: () => this.saving.set(false),
      });
  }

  private loadMenu(menuId: string): void {
    this.weekStart.set(this.view.nextMondayIso());

    this.getMenuService.getMenu(menuId).subscribe({
      next: (response) => this.detail.set(response.data.attributes),
    });
  }

  private t(key: string): string {
    return this.translationService.translate(key, MODULE_PATH);
  }
}
