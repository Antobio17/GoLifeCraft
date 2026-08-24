import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "ds-user-access-row",
  template: `
    <div class="ds-uar" [class.ds-uar--inactive]="!active">
      <div class="ds-uar__avatar">{{ initial }}</div>

      <button
        type="button"
        class="ds-uar__body"
        [class.ds-uar__body--selectable]="selectable"
        [disabled]="!selectable"
        [attr.aria-label]="selectAriaLabel || null"
        (click)="selected.emit()"
      >
        <div class="ds-uar__name">{{ name }}</div>
        <div class="ds-uar__email">{{ email }}</div>
        <div class="ds-uar__badges">
          <span
            class="ds-uar__badge"
            [class.ds-uar__badge--ok]="verified"
            [class.ds-uar__badge--warn]="!verified"
          >
            @if (verified) {
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            } @else {
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            }
            {{ verified ? verifiedLabel : unverifiedLabel }}
          </span>
        </div>
      </button>

      <button
        type="button"
        class="ds-uar__access"
        [disabled]="disabled"
        [attr.aria-pressed]="active"
        [attr.aria-label]="ariaLabel || null"
        (click)="toggled.emit()"
      >
        <span class="ds-uar__track" [class.is-on]="active">
          <span class="ds-uar__knob"></span>
        </span>
        <span class="ds-uar__perm" [class.is-on]="active">
          {{ active ? activeLabel : inactiveLabel }}
        </span>
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-uar {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-lg);
        padding: var(--ds-space-3);
        transition: opacity 0.15s ease;
      }
      .ds-uar--inactive {
        opacity: 0.62;
      }
      .ds-uar__avatar {
        flex: 0 0 auto;
        width: 2.625rem;
        height: 2.625rem;
        border-radius: var(--ds-radius-md);
        background: var(--ds-surface-inset);
        color: var(--ds-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: var(--ds-text-xl);
      }
      .ds-uar__body {
        flex: 1 1 auto;
        min-width: 0;
        appearance: none;
        border: none;
        background: none;
        padding: 0;
        margin: 0;
        font: inherit;
        color: inherit;
        text-align: left;
      }
      .ds-uar__body--selectable {
        cursor: pointer;
      }
      .ds-uar__name {
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-uar__email {
        margin-top: 1px;
        font-size: var(--ds-text-base);
        color: var(--ds-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-uar__badges {
        margin-top: var(--ds-space-1-5);
      }
      .ds-uar__badge {
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-1);
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.02em;
        border-radius: var(--ds-radius-sm);
        padding: var(--ds-space-1) var(--ds-space-2);
      }
      .ds-uar__badge--ok {
        background: var(--ds-accent-soft);
        color: var(--ds-accent-soft-text);
      }
      .ds-uar__badge--warn {
        background: var(--ds-warning-soft);
        color: var(--ds-warning);
      }
      .ds-uar__access {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--ds-space-1);
        appearance: none;
        border: none;
        background: none;
        padding: 0;
        cursor: pointer;
      }
      .ds-uar__access:disabled {
        cursor: default;
        opacity: 0.7;
      }
      .ds-uar__track {
        width: 2.625rem;
        height: 1.5rem;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
        border: 1px solid var(--ds-border-strong);
        padding: 2px;
        box-sizing: border-box;
        display: block;
        transition:
          background 0.18s ease,
          border-color 0.18s ease;
      }
      .ds-uar__track.is-on {
        background: var(--ds-primary);
        border-color: var(--ds-primary);
      }
      .ds-uar__knob {
        display: block;
        width: 1.125rem;
        height: 1.125rem;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-raised);
        box-shadow: 0 1px 0.1875rem rgba(0, 0, 0, 0.2);
        transition: transform 0.18s ease;
      }
      .ds-uar__track.is-on .ds-uar__knob {
        transform: translateX(1.125rem);
      }
      .ds-uar__perm {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.05em;
        color: var(--ds-text-meta);
      }
      .ds-uar__perm.is-on {
        color: var(--ds-primary);
      }
    `,
  ],
})
export class UserAccessRowComponent {
  @Input() initial = "?";
  @Input() name = "";
  @Input() email = "";
  @Input() verified = false;
  @Input() verifiedLabel = "";
  @Input() unverifiedLabel = "";
  @Input() active = false;
  @Input() activeLabel = "";
  @Input() inactiveLabel = "";
  @Input() disabled = false;
  @Input() ariaLabel = "";
  @Input() selectable = false;
  @Input() selectAriaLabel = "";
  @Output() toggled = new EventEmitter<void>();
  @Output() selected = new EventEmitter<void>();
}
