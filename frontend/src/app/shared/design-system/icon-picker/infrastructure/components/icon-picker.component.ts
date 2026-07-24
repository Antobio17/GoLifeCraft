import { Component, Input, computed, forwardRef, signal } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { SearchInputComponent } from "../../../search-input/infrastructure/components/search-input.component";
import { ModalSheetComponent } from "../../../modal-sheet/infrastructure/components/modal-sheet.component";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";
import { IconGroup } from "../../domain/models/icon-group.model";

@Component({
  selector: "ds-icon-picker",
  standalone: true,
  imports: [SearchInputComponent, ModalSheetComponent, IconComponent],
  template: `
    <button
      type="button"
      class="ds-icon-trigger"
      [disabled]="disabled"
      [attr.aria-label]="triggerLabel"
      (click)="openSheet()"
    >
      <ds-icon
        class="ds-icon-trigger__preview"
        [name]="preview()"
        [size]="30"
      />
      <span class="ds-icon-trigger__badge" aria-hidden="true">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
        </svg>
      </span>
    </button>

    <ds-modal-sheet
      [open]="open()"
      [compact]="true"
      [title]="sheetTitle"
      [closeLabel]="closeLabel"
      (closed)="closeSheet()"
    >
      <div class="ds-icon-sheet">
        <ds-search-input
          [placeholder]="searchPlaceholder"
          [debounce]="120"
          (searched)="onSearch($event)"
        ></ds-search-input>

        @if (visibleGroups().length === 0) {
          <p class="ds-icon-sheet__empty">{{ emptyLabel }}</p>
        }

        @for (group of visibleGroups(); track group.label) {
          <div class="ds-icon-sheet__group">
            <span class="ds-icon-sheet__region">{{ group.label }}</span>
            <div
              class="ds-icon-sheet__grid"
              role="group"
              [attr.aria-label]="group.label"
            >
              @for (item of group.items; track item.icon) {
                <button
                  type="button"
                  class="ds-icon-cell"
                  [class.is-selected]="isSelected(item.icon)"
                  [attr.aria-label]="item.label"
                  [attr.aria-pressed]="isSelected(item.icon)"
                  [title]="item.label"
                  (click)="select(item.icon)"
                >
                  <ds-icon [name]="item.icon" [size]="24" />
                </button>
              }
            </div>
          </div>
        }
      </div>
    </ds-modal-sheet>
  `,
  styles: [
    `
      .ds-icon-trigger {
        position: relative;
        appearance: none;
        cursor: pointer;
        width: 64px;
        height: 64px;
        border-radius: 16px;
        background: var(--ds-surface-inset);
        border: 1px solid var(--ds-border);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        color: var(--ds-primary);
      }
      .ds-icon-trigger:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .ds-icon-trigger__badge {
        position: absolute;
        right: -5px;
        bottom: -5px;
        width: 24px;
        height: 24px;
        border-radius: 8px;
        background: var(--ds-primary);
        color: var(--ds-on-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.22);
      }
      .ds-icon-sheet {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .ds-icon-sheet__empty {
        margin: 0;
        padding: 8px 2px;
        font-size: var(--ds-text-sm);
        color: var(--ds-text-meta);
      }
      .ds-icon-sheet__group {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .ds-icon-sheet__region {
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--ds-text-meta);
      }
      .ds-icon-sheet__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(46px, 1fr));
        gap: 9px;
      }
      .ds-icon-cell {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        appearance: none;
        cursor: pointer;
        border: 1px solid var(--ds-border);
        background: var(--ds-surface-subtle);
        border-radius: 13px;
        height: 50px;
        color: var(--ds-text-strong);
        transition: all 0.14s ease;
      }
      .ds-icon-cell:hover:not(.is-selected) {
        border-color: var(--ds-primary-soft-border);
        transform: translateY(-1px);
      }
      .ds-icon-cell.is-selected {
        border-color: transparent;
        background: var(--ds-primary-soft);
        color: var(--ds-primary);
        box-shadow: inset 0 0 0 2px var(--ds-primary);
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IconPickerComponent),
      multi: true,
    },
  ],
})
export class IconPickerComponent implements ControlValueAccessor {
  @Input() set groups(value: IconGroup[]) {
    this.allGroups.set(value ?? []);
  }
  @Input() fallback: DsIconName = "dumbbell";
  @Input() sheetTitle = "Elige un icono";
  @Input() closeLabel = "Cerrar";
  @Input() triggerLabel = "Elegir icono";
  @Input() searchPlaceholder = "Buscar icono...";
  @Input() emptyLabel = "Sin resultados.";

  value: DsIconName | null = null;
  disabled = false;

  private allGroups = signal<IconGroup[]>([]);
  private query = signal("");
  private selected = signal<DsIconName | null>(null);
  open = signal(false);

  preview = computed<DsIconName>(() => this.selected() ?? this.fallback);

  visibleGroups = computed(() => {
    const term = this.normalize(this.query());

    if (term.length === 0) {
      return this.allGroups();
    }

    return this.allGroups()
      .map((group) => ({
        label: group.label,
        items: group.items.filter((item) =>
          this.matches(item.icon, item.label, item.keywords, term),
        ),
      }))
      .filter((group) => group.items.length > 0);
  });

  private onChange: (value: DsIconName | null) => void = () => {};
  private onTouched: () => void = () => {};

  isSelected(icon: DsIconName): boolean {
    return this.value === icon;
  }

  openSheet(): void {
    if (this.disabled) return;
    this.query.set("");
    this.open.set(true);
  }

  closeSheet(): void {
    this.open.set(false);
    this.onTouched();
  }

  onSearch(term: string): void {
    this.query.set(term);
  }

  select(icon: DsIconName): void {
    if (this.disabled) return;
    this.value = icon;
    this.selected.set(icon);
    this.onChange(this.value);
    this.closeSheet();
  }

  writeValue(value: DsIconName | null): void {
    this.value = value ?? null;
    this.selected.set(this.value);
  }

  registerOnChange(fn: (value: DsIconName | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private matches(
    icon: string,
    label: string,
    keywords: string[] | undefined,
    term: string,
  ): boolean {
    const haystack = this.normalize(
      [icon, label, ...(keywords ?? [])].join(" "),
    );

    return haystack.includes(term);
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  }
}
