import {
  Component,
  Input,
  computed,
  forwardRef,
  inject,
  signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { SearchInputComponent } from "../../../search-input/infrastructure/components/search-input.component";
import { ModalSheetComponent } from "../../../modal-sheet/infrastructure/components/modal-sheet.component";
import { EmojiGroup } from "../../domain/models/emoji-group.model";
import { TextSearchService } from "@shared/search/application/services/text-search.service";

@Component({
  selector: "ds-emoji-picker",
  imports: [SearchInputComponent, ModalSheetComponent],
  template: `
    <button
      type="button"
      class="ds-emoji-trigger"
      [disabled]="disabled"
      [attr.aria-label]="triggerLabel"
      (click)="openSheet()"
    >
      <span class="ds-emoji-trigger__preview">{{ preview() }}</span>
      <span class="ds-emoji-trigger__badge" aria-hidden="true">
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
      <div class="ds-emoji-sheet">
        <ds-search-input
          [placeholder]="searchPlaceholder"
          [debounce]="120"
          (searched)="onSearch($event)"
        ></ds-search-input>

        @if (visibleGroups().length === 0) {
          <p class="ds-emoji-sheet__empty">{{ emptyLabel }}</p>
        }

        @for (group of visibleGroups(); track group.label) {
          <div class="ds-emoji-sheet__group">
            <span class="ds-emoji-sheet__region">{{ group.label }}</span>
            <div
              class="ds-emoji-sheet__grid"
              role="group"
              [attr.aria-label]="group.label"
            >
              @for (item of group.items; track item.emoji) {
                <button
                  type="button"
                  class="ds-emoji-cell"
                  [class.is-selected]="isSelected(item.emoji)"
                  [attr.aria-label]="item.label"
                  [attr.aria-pressed]="isSelected(item.emoji)"
                  [title]="item.label"
                  (click)="select(item.emoji)"
                >
                  {{ item.emoji }}
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
      .ds-emoji-trigger {
        position: relative;
        appearance: none;
        cursor: pointer;
        width: 4rem;
        height: 4rem;
        border-radius: var(--ds-radius-xl);
        background: var(--ds-surface-inset);
        border: 1px solid var(--ds-border);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }
      .ds-emoji-trigger:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .ds-emoji-trigger__preview {
        font-size: var(--ds-text-3xl);
        line-height: 1;
      }
      .ds-emoji-trigger__badge {
        position: absolute;
        right: -0.3125rem;
        bottom: -0.3125rem;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: var(--ds-radius-md);
        background: var(--ds-primary);
        color: var(--ds-on-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 0.375rem rgba(0, 0, 0, 0.22);
      }
      .ds-emoji-sheet {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-4);
      }
      .ds-emoji-sheet__empty {
        margin: 0;
        padding: var(--ds-space-2) 2px;
        font-size: var(--ds-text-base);
        color: var(--ds-text-meta);
      }
      .ds-emoji-sheet__group {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-2);
      }
      .ds-emoji-sheet__region {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-bold);
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--ds-text-meta);
      }
      .ds-emoji-sheet__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(2.875rem, 1fr));
        gap: var(--ds-space-2);
      }
      .ds-emoji-cell {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        appearance: none;
        cursor: pointer;
        border: 1px solid var(--ds-border);
        background: var(--ds-surface-subtle);
        border-radius: var(--ds-radius-lg);
        height: 3.125rem;
        font: inherit;
        font-size: var(--ds-text-2xl);
        line-height: 1;
        user-select: none;
        transition: var(--ds-motion-tint), var(--ds-motion-press);
      }
      .ds-emoji-cell:hover:not(.is-selected) {
        border-color: var(--ds-primary-soft-border);
        transform: translateY(-1px);
      }
      .ds-emoji-cell.is-selected {
        border-color: transparent;
        background: var(--ds-primary-soft);
        box-shadow: inset 0 0 0 2px var(--ds-primary);
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmojiPickerComponent),
      multi: true,
    },
  ],
})
export class EmojiPickerComponent implements ControlValueAccessor {
  @Input() set groups(value: EmojiGroup[]) {
    this.allGroups.set(value ?? []);
  }
  @Input() fallback = "🍽️";
  @Input() sheetTitle = "Elige un icono";
  @Input() closeLabel = "Cerrar";
  @Input() triggerLabel = "Elegir icono";
  @Input() searchPlaceholder = "Buscar emoji...";
  @Input() emptyLabel = "Sin resultados.";

  value: string | null = null;
  disabled = false;

  private allGroups = signal<EmojiGroup[]>([]);
  private query = signal("");
  private selected = signal<string | null>(null);
  open = signal(false);

  preview = computed(() => this.selected() || this.fallback);

  private textSearch = inject(TextSearchService);

  visibleGroups = computed(() => {
    const term = this.query().trim();

    if (term.length === 0) {
      return this.allGroups();
    }

    return this.allGroups()
      .map((group) => ({
        label: group.label,
        items: group.items.filter((item) =>
          this.matches(item.emoji, item.label, item.keywords, term),
        ),
      }))
      .filter((group) => group.items.length > 0);
  });

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  isSelected(emoji: string): boolean {
    return this.value === emoji;
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

  select(emoji: string): void {
    if (this.disabled) return;
    this.value = emoji;
    this.selected.set(emoji);
    this.onChange(this.value);
    this.closeSheet();
  }

  writeValue(value: string | null): void {
    this.value = value ?? null;
    this.selected.set(this.value);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private matches(
    emoji: string,
    label: string,
    keywords: string[] | undefined,
    term: string,
  ): boolean {
    if (emoji === term) return true;

    if (this.textSearch.tokens(term).length === 0) return false;

    return this.textSearch.matches(term, label, ...(keywords ?? []));
  }
}
