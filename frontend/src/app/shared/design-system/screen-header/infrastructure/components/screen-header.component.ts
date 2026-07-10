import { Component, EventEmitter, Input, Output } from "@angular/core";

export type ScreenHeaderLeading = "back" | "close" | null;

@Component({
  selector: "ds-screen-header",
  standalone: true,
  template: `
    <header class="ds-screen-head">
      @if (leading) {
        <button
          type="button"
          class="ds-screen-head__lead"
          [attr.aria-label]="leadingLabel"
          (click)="leadingClick.emit()"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            @if (leading === "back") {
              <path d="M15 5l-7 7 7 7" />
            } @else {
              <path d="M18 6L6 18M6 6l12 12" />
            }
          </svg>
        </button>
      }

      <div class="ds-screen-head__text">
        @if (eyebrow) {
          <span class="ds-screen-head__eyebrow">{{ eyebrow }}</span>
        }
        <h1 class="ds-screen-head__title">{{ title }}</h1>
        @if (subtitle) {
          <p class="ds-screen-head__subtitle">{{ subtitle }}</p>
        }
      </div>

      <div class="ds-screen-head__actions">
        <ng-content select="[slot=actions]"></ng-content>
      </div>
    </header>
  `,
  styles: [
    `
      .ds-screen-head {
        display: flex;
        align-items: center;
        gap: 11px;
      }
      .ds-screen-head__lead {
        flex: 0 0 auto;
        width: 40px;
        height: 40px;
        padding: 0;
        box-sizing: border-box;
        line-height: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        appearance: none;
        border: none;
        background: var(--ds-surface-inset);
        color: var(--ds-text);
        border-radius: var(--ds-radius-xl);
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .ds-screen-head__lead:hover {
        background: color-mix(in srgb, var(--ds-surface-inset) 88%, black);
      }
      .ds-screen-head__text {
        flex: 1 1 auto;
        min-width: 0;
      }
      .ds-screen-head__eyebrow {
        display: block;
        font-size: 9.5px;
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.09em;
        text-transform: uppercase;
        color: var(--ds-text-meta);
      }
      .ds-screen-head__title {
        margin: 0;
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: var(--ds-text-xl);
        letter-spacing: -0.02em;
        color: var(--ds-text);
        line-height: 1.15;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-screen-head__subtitle {
        margin: 2px 0 0;
        font-size: var(--ds-text-label);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
      .ds-screen-head__actions {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .ds-screen-head__actions:empty {
        display: none;
      }
    `,
  ],
})
export class ScreenHeaderComponent {
  @Input() leading: ScreenHeaderLeading = null;
  @Input() leadingLabel = "";
  @Input() eyebrow: string | null = null;
  @Input() title = "";
  @Input() subtitle: string | null = null;
  @Output() leadingClick = new EventEmitter<void>();
}
