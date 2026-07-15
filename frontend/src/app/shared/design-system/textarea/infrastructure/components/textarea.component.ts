import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "ds-textarea",
  standalone: true,
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
      [style.resize]="resize"
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
        border-radius: var(--ds-radius-lg);
        background: var(--ds-surface);
        color: var(--ds-text);
        font: inherit;
        font-size: var(--ds-text-base);
        line-height: 1.45;
        padding: 11px 12px;
        outline: none;
        transition:
          border-color var(--ds-transition-fast),
          box-shadow var(--ds-transition-fast);
      }
      .ds-textarea--compact {
        border-color: var(--ds-border);
        background: var(--ds-surface-inset);
        font-size: 12px;
        padding: 8px 10px;
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
