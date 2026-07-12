import { Component, Input, computed, forwardRef, signal } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { SearchInputComponent } from "../../../search-input/infrastructure/components/search-input.component";
import { EmojiGroup } from "../../domain/models/emoji-group.model";

@Component({
  selector: "ds-emoji-picker",
  standalone: true,
  imports: [SearchInputComponent],
  template: `
    <div class="ds-emoji-picker">
      <ds-search-input
        [placeholder]="searchPlaceholder"
        [debounce]="120"
        (searched)="onSearch($event)"
      ></ds-search-input>

      @if (visibleGroups().length === 0) {
        <p class="ds-emoji-picker__empty">{{ emptyLabel }}</p>
      }

      @for (group of visibleGroups(); track group.label) {
        <div class="ds-emoji-picker__group">
          <span class="ds-emoji-picker__region">{{ group.label }}</span>
          <div
            class="ds-emoji-picker__items"
            role="group"
            [attr.aria-label]="group.label"
          >
            @for (item of group.items; track item.emoji) {
              <button
                type="button"
                class="ds-emoji-cell"
                [class.is-selected]="isSelected(item.emoji)"
                [disabled]="disabled"
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
  `,
  styles: [
    `
      .ds-emoji-picker {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .ds-emoji-picker__empty {
        margin: 0;
        padding: 8px 2px;
        font-size: var(--ds-text-sm);
        color: var(--ds-text-meta);
      }
      .ds-emoji-picker__group {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .ds-emoji-picker__region {
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--ds-text-meta);
      }
      .ds-emoji-picker__items {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
        gap: 8px;
      }
      .ds-emoji-cell {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        appearance: none;
        cursor: pointer;
        border: 1px solid var(--ds-border-input);
        background: var(--ds-surface);
        border-radius: var(--ds-radius-lg);
        aspect-ratio: 1;
        font: inherit;
        font-size: 1.5rem;
        line-height: 1;
        user-select: none;
        transition: all 0.14s ease;
      }
      .ds-emoji-cell:hover:not(:disabled):not(.is-selected) {
        border-color: var(--ds-primary-soft-border);
        transform: translateY(-1px);
      }
      .ds-emoji-cell.is-selected {
        border-color: var(--ds-primary);
        background: var(--ds-primary-soft);
        box-shadow: 0 0 0 2px var(--ds-primary) inset;
      }
      .ds-emoji-cell:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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
  @Input() searchPlaceholder = "Buscar emoji...";
  @Input() emptyLabel = "Sin resultados.";

  value: string | null = null;
  disabled = false;

  private allGroups = signal<EmojiGroup[]>([]);
  private query = signal("");

  visibleGroups = computed(() => {
    const term = this.normalize(this.query());

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

  onSearch(term: string): void {
    this.query.set(term);
  }

  select(emoji: string): void {
    if (this.disabled) return;
    this.value = this.value === emoji ? null : emoji;
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: string | null): void {
    this.value = value ?? null;
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

    const haystack = this.normalize([label, ...(keywords ?? [])].join(" "));

    return haystack.includes(term);
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  }
}
