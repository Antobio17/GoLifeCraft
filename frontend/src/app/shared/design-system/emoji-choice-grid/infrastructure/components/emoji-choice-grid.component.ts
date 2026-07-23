import { Component, Input, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "ds-emoji-choice-grid",
  standalone: true,
  template: `
    <div
      class="ds-emoji-choice-grid"
      role="radiogroup"
      [attr.aria-label]="ariaLabel"
    >
      @for (emoji of emojis; track emoji) {
        <button
          type="button"
          class="ds-emoji-choice"
          [class.is-selected]="value === emoji"
          [disabled]="disabled"
          role="radio"
          [attr.aria-checked]="value === emoji"
          [attr.aria-label]="emoji"
          (click)="select(emoji)"
        >
          {{ emoji }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-emoji-choice-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 8px;
        max-width: 100%;
      }
      .ds-emoji-choice {
        min-width: 0;
        box-sizing: border-box;
        appearance: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        aspect-ratio: 1;
        border-radius: 12px;
        border: 1px solid var(--ds-border-strong);
        background: var(--ds-surface);
        padding: 0;
        font: inherit;
        font-size: 22px;
        line-height: 1;
        user-select: none;
        transition: transform 0.12s ease;
      }
      .ds-emoji-choice:hover:not(:disabled):not(.is-selected) {
        transform: translateY(-1px);
      }
      .ds-emoji-choice.is-selected {
        border: 2px solid var(--ds-primary);
        background: var(--ds-primary-soft);
      }
      .ds-emoji-choice:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmojiChoiceGridComponent),
      multi: true,
    },
  ],
})
export class EmojiChoiceGridComponent implements ControlValueAccessor {
  @Input() emojis: string[] = [];
  @Input() ariaLabel = "";

  value: string | null = null;
  disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  select(emoji: string): void {
    if (this.disabled) return;

    this.value = emoji;
    this.onChange(emoji);
    this.onTouched();
  }

  writeValue(value: string | null): void {
    this.value = value ?? null;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
