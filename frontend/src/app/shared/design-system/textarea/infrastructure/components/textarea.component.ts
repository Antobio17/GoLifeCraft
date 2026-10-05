import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "ds-textarea",
  template: `
    <textarea
      class="ds-textarea"
      [class.ds-textarea--compact]="compact"
      [class.ds-textarea--invalid]="invalid"
      [value]="value"
      [placeholder]="placeholder"
      [rows]="rows"
      [disabled]="disabled"
      [attr.maxlength]="maxLength || null"
      [attr.aria-label]="ariaLabel || null"
      [style.resize]="compact ? null : resize"
      (input)="onInput($event)"
    ></textarea>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-textarea {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid var(--ds-border-input);
        border-radius: var(--ds-radius-md);
        background: var(--ds-surface);
        color: var(--ds-text);
        font: inherit;
        font-size: var(--ds-text-md);
        line-height: 1.45;
        padding: var(--ds-space-3);
        outline: none;
        transition:
          border-color var(--ds-transition-fast),
          box-shadow var(--ds-transition-fast);
      }
      .ds-textarea--compact {
        field-sizing: content;
        min-height: 2.375rem;
        max-height: 8rem;
        border-color: var(--ds-border-hairline);
        border-radius: var(--ds-radius-lg);
        background: var(--ds-surface-inset);
        font-size: var(--ds-text-md);
        line-height: var(--ds-leading-snug);
        padding: var(--ds-space-2) var(--ds-space-3);
        resize: none;
      }
      .ds-textarea::placeholder {
        color: var(--ds-text-meta);
      }
      .ds-textarea:focus {
        border-color: var(--ds-border-focus);
        box-shadow: var(--ds-focus-ring);
      }
      .ds-textarea:disabled {
        background: var(--ds-surface-subtle);
        opacity: 0.65;
        cursor: not-allowed;
      }
      .ds-textarea--invalid,
      .ds-textarea--invalid:focus {
        border-color: var(--ds-danger);
        box-shadow: none;
      }
    `,
  ],
})
export class TextareaComponent {
  @Input() value = "";
  @Input() placeholder = "";
  @Input() rows = 3;
  @Input() resize: "none" | "vertical" | "both" = "vertical";
  @Input() maxLength?: number;
  @Input() ariaLabel = "";
  @Input() disabled = false;
  @Input() compact = false;
  @Input() invalid = false;

  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLTextAreaElement).value);
  }
}
