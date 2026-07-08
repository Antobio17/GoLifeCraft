import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-field",
  standalone: true,
  template: `
    <div class="ds-field">
      @if (label) {
        <span class="ds-field__label">
          {{ label }}
          @if (required) {
            <span class="ds-field__required" aria-hidden="true">*</span>
          }
          @if (count !== null && count !== undefined) {
            <span class="ds-field__count">{{ count }}</span>
          }
        </span>
      }
      <ng-content></ng-content>
      @if (hint) {
        <p class="ds-field__hint">
          @if (hintIcon) {
            <svg
              class="ds-field__hint-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          }
          <span>{{ hint }}</span>
        </p>
      }
      @if (error) {
        <p class="ds-field__error">{{ error }}</p>
      }
    </div>
  `,
  styles: [
    `
      .ds-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ds-field__label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--ds-text-meta);
      }
      .ds-field__required {
        color: var(--ds-danger);
      }
      .ds-field__count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px 8px;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
        font-size: 10px;
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0;
      }
      .ds-field__hint {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        margin: 2px 0 0;
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
        line-height: 1.45;
      }
      .ds-field__hint-icon {
        flex: 0 0 auto;
        margin-top: 1px;
        color: var(--ds-text-meta);
      }
      .ds-field__error {
        margin: 2px 0 0;
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-danger);
      }
    `,
  ],
})
export class FieldComponent {
  @Input() label = "";
  @Input() required = false;
  @Input() hint = "";
  @Input() hintIcon = false;
  @Input() error = "";
  @Input() count: number | string | null = null;
}
