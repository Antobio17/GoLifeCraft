import { Component, computed, input, output, signal } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { EmojiTileComponent } from "../../../emoji-tile/infrastructure/components/emoji-tile.component";
import { QuickAddSuggestion } from "../../domain/models/quick-add-suggestion.model";

@Component({
  selector: "ds-quick-add",
  imports: [IconComponent, EmojiTileComponent],
  template: `
    <form class="ds-qadd" (submit)="onSubmit($event)">
      <span class="ds-qadd__field">
        <ds-icon name="plus" [size]="17" [stroke]="2.4" />
        <input
          class="ds-qadd__input"
          type="text"
          autocomplete="off"
          role="combobox"
          aria-autocomplete="list"
          [attr.aria-controls]="listId"
          [attr.aria-expanded]="showList()"
          [attr.aria-label]="ariaLabel() || placeholder()"
          [attr.maxlength]="maxLength()"
          [placeholder]="placeholder()"
          [value]="query()"
          (input)="onInput($event)"
          (keydown)="onKeydown($event)"
          (focus)="focused.set(true)"
          (blur)="focused.set(false)"
        />
      </span>

      <button
        type="submit"
        class="ds-qadd__submit"
        [disabled]="!query().trim()"
        [attr.aria-label]="submitLabel()"
      >
        <ds-icon name="arrowRight" [size]="17" [stroke]="2.4" />
      </button>

      @if (showList()) {
        <ul
          class="ds-qadd__list"
          role="listbox"
          [id]="listId"
          [attr.aria-label]="ariaLabel() || placeholder()"
        >
          @for (
            suggestion of suggestions();
            track suggestion.key;
            let index = $index
          ) {
            <li
              role="option"
              tabindex="0"
              class="ds-qadd__option"
              [class.is-active]="index === highlighted()"
              [attr.aria-selected]="index === highlighted()"
              (mousedown)="$event.preventDefault()"
              (click)="pick(suggestion.key)"
              (keydown.enter)="pick(suggestion.key)"
              (keydown.space)="$event.preventDefault(); pick(suggestion.key)"
            >
              <ds-emoji-tile
                [emoji]="suggestion.emoji"
                [imageUrl]="suggestion.imageUrl"
                [alt]="suggestion.label"
                [size]="32"
              />
              <span class="ds-qadd__text">
                <span class="ds-qadd__label">{{ suggestion.label }}</span>
                @if (suggestion.meta) {
                  <span class="ds-qadd__meta">{{ suggestion.meta }}</span>
                }
              </span>
            </li>
          }
          <li
            role="option"
            tabindex="0"
            class="ds-qadd__option ds-qadd__option--free"
            [class.is-active]="highlighted() === suggestions().length"
            [attr.aria-selected]="highlighted() === suggestions().length"
            (mousedown)="$event.preventDefault()"
            (click)="submitFree()"
            (keydown.enter)="submitFree()"
            (keydown.space)="$event.preventDefault(); submitFree()"
          >
            <ds-icon name="pencil" [size]="15" [stroke]="2.2" />
            <span class="ds-qadd__label"
              >{{ freeLabel() }} «{{ query().trim() }}»</span
            >
          </li>
        </ul>
      }
    </form>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
      }
      .ds-qadd {
        display: flex;
        gap: var(--ds-space-2);
        margin: 0;
      }
      .ds-qadd__field {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        height: 2.75rem;
        padding: 0 var(--ds-space-3);
        border-radius: var(--ds-radius-control);
        border: 1px solid var(--ds-border-input);
        background: var(--ds-surface);
        color: var(--ds-text-muted);
        transition: var(--ds-motion-tint);
      }
      .ds-qadd__field:focus-within {
        border-color: var(--ds-border-focus);
        box-shadow: var(--ds-focus-ring);
      }
      .ds-qadd__input {
        flex: 1 1 auto;
        min-width: 0;
        height: 100%;
        border: 0;
        outline: none;
        background: transparent;
        font: inherit;
        font-size: var(--ds-text-base);
        color: var(--ds-text);
      }
      .ds-qadd__input::placeholder {
        color: var(--ds-text-muted);
      }
      .ds-qadd__submit {
        flex: none;
        width: 2.75rem;
        height: 2.75rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: var(--ds-radius-control);
        background: var(--ds-primary);
        color: var(--ds-on-primary);
        cursor: pointer;
      }
      .ds-qadd__submit:disabled {
        cursor: default;
        background: var(--ds-surface-inset);
        color: var(--ds-text-muted);
      }
      .ds-qadd__list {
        position: absolute;
        z-index: 20;
        top: calc(100% + var(--ds-space-1));
        left: 0;
        right: 0;
        margin: 0;
        padding: var(--ds-space-1);
        list-style: none;
        display: flex;
        flex-direction: column;
        border-radius: var(--ds-radius-inner);
        border: 1px solid var(--ds-border);
        background: var(--ds-surface-raised);
        box-shadow: var(--ds-elev);
      }
      .ds-qadd__option {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        padding: var(--ds-space-1-5) var(--ds-space-2);
        border-radius: var(--ds-radius-control-sm);
        cursor: pointer;
        color: var(--ds-text);
      }
      .ds-qadd__option.is-active,
      .ds-qadd__option:hover {
        background: var(--ds-surface-inset);
      }
      .ds-qadd__option--free {
        color: var(--ds-primary);
      }
      .ds-qadd__text {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .ds-qadd__meta {
        white-space: normal;
        overflow-wrap: anywhere;
      }
      .ds-qadd__label {
        white-space: normal;
        overflow-wrap: anywhere;
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
      }
      .ds-qadd__meta {
        font-size: var(--ds-text-xs);
        color: var(--ds-text-muted);
      }
    `,
  ],
})
export class QuickAddComponent {
  private static nextId = 0;
  readonly listId = `quick-add-list-${QuickAddComponent.nextId++}`;
  readonly placeholder = input("");
  readonly ariaLabel = input("");
  readonly submitLabel = input("");
  readonly freeLabel = input("");
  readonly maxLength = input(120);
  readonly suggestions = input<QuickAddSuggestion[]>([]);

  readonly queryChange = output<string>();
  readonly picked = output<string>();
  readonly submitted = output<string>();

  readonly query = signal("");
  readonly focused = signal(false);
  readonly highlighted = signal(0);

  readonly showList = computed(
    () => this.focused() && this.query().trim().length > 0,
  );

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.highlighted.set(0);
    this.queryChange.emit(value);
  }

  onKeydown(event: KeyboardEvent): void {
    const last = this.suggestions().length;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.highlighted.update((index) => Math.min(last, index + 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.highlighted.update((index) => Math.max(0, index - 1));
      return;
    }

    if (event.key === "Escape") {
      this.reset();
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.query().trim()) return;

    const suggestion = this.suggestions()[this.highlighted()];
    if (!suggestion) {
      this.submitFree();
      return;
    }

    this.pick(suggestion.key);
  }

  pick(key: string): void {
    this.picked.emit(key);
    this.reset();
  }

  submitFree(): void {
    const text = this.query().trim();
    if (!text) return;

    this.submitted.emit(text);
    this.reset();
  }

  private reset(): void {
    this.query.set("");
    this.highlighted.set(0);
    this.queryChange.emit("");
  }
}
