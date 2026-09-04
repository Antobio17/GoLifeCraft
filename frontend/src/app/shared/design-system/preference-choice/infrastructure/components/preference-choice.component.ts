import { Component, EventEmitter, Input, Output } from "@angular/core";
import { PreferenceChoiceOption } from "@shared/design-system/preference-choice/domain/models/preference-choice-option.model";

const ARROW_STEPS: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

@Component({
  selector: "ds-preference-choice",
  template: `
    <div class="ds-prefchoice" [class.is-inset]="'inset' === tone">
      <span class="ds-prefchoice__text">
        <span class="ds-prefchoice__title">{{ title }}</span>
        @if (subtitle) {
          <span class="ds-prefchoice__subtitle">{{ subtitle }}</span>
        }
      </span>
      <div
        class="ds-prefchoice__options"
        role="radiogroup"
        [attr.aria-label]="title"
      >
        @for (option of options; track option.value; let first = $first) {
          <button
            type="button"
            class="ds-prefchoice__option"
            role="radio"
            [class.is-selected]="value === option.value"
            [attr.aria-checked]="value === option.value"
            [attr.tabindex]="
              value === option.value || (!hasSelection && first) ? 0 : -1
            "
            [disabled]="disabled"
            (click)="select(option.value)"
            (keydown)="onKeydown($event)"
          >
            {{ option.label }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-prefchoice {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--ds-space-3);
        width: 100%;
        padding: var(--ds-space-3);
        border-top: 1px solid var(--ds-border-hairline);
        font-family: var(--ds-font-body);
      }
      :host(:first-of-type) .ds-prefchoice {
        border-top: none;
        border-top-left-radius: var(--ds-radius-xl);
        border-top-right-radius: var(--ds-radius-xl);
      }
      :host(:last-of-type) .ds-prefchoice {
        border-bottom-left-radius: var(--ds-radius-xl);
        border-bottom-right-radius: var(--ds-radius-xl);
      }
      .ds-prefchoice.is-inset {
        background: var(--ds-surface-inset);
      }
      .ds-prefchoice__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .ds-prefchoice__title {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text);
      }
      .ds-prefchoice__subtitle {
        font-size: var(--ds-text-sm);
        color: var(--ds-text-meta);
      }
      .ds-prefchoice__options {
        flex: 0 0 auto;
        display: flex;
        gap: 2px;
        padding: 2px;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
        border: 1px solid var(--ds-border);
      }
      .ds-prefchoice.is-inset .ds-prefchoice__options {
        background: var(--ds-surface);
      }
      .ds-prefchoice__option {
        appearance: none;
        border: none;
        cursor: pointer;
        white-space: nowrap;
        padding: var(--ds-space-1) var(--ds-space-3);
        border-radius: var(--ds-radius-pill);
        background: transparent;
        color: var(--ds-text-muted);
        font: inherit;
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-bold);
        transition:
          background var(--ds-transition-fast),
          color var(--ds-transition-fast);
      }
      .ds-prefchoice__option:hover:not(:disabled):not(.is-selected) {
        color: var(--ds-text);
      }
      .ds-prefchoice__option.is-selected {
        background: var(--ds-primary);
        color: var(--ds-on-primary);
      }
      .ds-prefchoice__option:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
    `,
  ],
})
export class PreferenceChoiceComponent {
  @Input() title = "";
  @Input() subtitle = "";
  @Input() options: PreferenceChoiceOption[] = [];
  @Input() value = "";
  @Input() tone: "plain" | "inset" = "plain";
  @Input() disabled = false;

  @Output() changed = new EventEmitter<string>();

  get hasSelection(): boolean {
    return this.options.some((option) => option.value === this.value);
  }

  select(value: string): void {
    if (this.disabled || value === this.value) {
      return;
    }

    this.changed.emit(value);
  }

  onKeydown(event: KeyboardEvent): void {
    const step = ARROW_STEPS[event.key];

    if (undefined === step || this.disabled || 0 === this.options.length) {
      return;
    }

    event.preventDefault();

    const current = this.options.findIndex(
      (option) => option.value === this.value,
    );
    const nextIndex =
      0 > current
        ? 0
        : (current + step + this.options.length) % this.options.length;

    this.focusOption(event.currentTarget, nextIndex);
    this.select(this.options[nextIndex].value);
  }

  private focusOption(origin: EventTarget | null, index: number): void {
    if (!(origin instanceof HTMLElement)) {
      return;
    }

    const option = origin.parentElement?.children.item(index);

    if (!(option instanceof HTMLElement)) {
      return;
    }

    option.focus();
  }
}
