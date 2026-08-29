import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-check-row",
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="ds-checkrow"
      role="checkbox"
      [class.is-done]="checked"
      [attr.aria-checked]="checked"
      (click)="toggled.emit()"
    >
      <span class="ds-checkrow__box" [class.is-on]="checked">
        <ds-icon name="check" [size]="15" [stroke]="3" />
      </span>
      @if (emoji) {
        <span class="ds-checkrow__emoji">{{ emoji }}</span>
      }
      <span class="ds-checkrow__text">
        @if (eyebrow || chip) {
          <span class="ds-checkrow__head">
            @if (eyebrow) {
              <span class="ds-checkrow__eyebrow">{{ eyebrow }}</span>
            }
            @if (chip) {
              <span class="ds-checkrow__chip">{{ chip }}</span>
            }
          </span>
        }
        <span class="ds-checkrow__name">{{ name }}</span>
        @if (meta) {
          <span class="ds-checkrow__meta">{{ meta }}</span>
        }
      </span>
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-checkrow {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        width: 100%;
        text-align: left;
        appearance: none;
        border: none;
        cursor: pointer;
        background: var(--ds-surface-inset);
        border-radius: var(--ds-radius-lg);
        padding: var(--ds-space-2) var(--ds-space-3);
        font: inherit;
        color: inherit;
        transition: opacity var(--ds-transition-fast);
      }
      /* What is still pending is what you need to read while cooking, so the tick fades the row
         instead of lighting it up. */
      .ds-checkrow.is-done {
        opacity: 0.5;
      }
      .ds-checkrow__box {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.625rem;
        height: 1.625rem;
        border-radius: var(--ds-radius-md);
        background: var(--ds-surface);
        border: 1.5px solid var(--ds-border-strong);
        color: transparent;
        transition:
          background var(--ds-transition-fast),
          color var(--ds-transition-fast);
      }
      .ds-checkrow__box.is-on {
        background: var(--ds-primary);
        border-color: var(--ds-primary);
        color: var(--ds-on-primary);
      }
      .ds-checkrow__emoji {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.25rem;
        height: 2.25rem;
        border-radius: var(--ds-radius-lg);
        background: var(--ds-surface);
        font-size: var(--ds-text-xl);
      }
      .ds-checkrow__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ds-checkrow__name {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-checkrow__meta {
        font-size: var(--ds-text-xs);
        color: var(--ds-text-muted);
      }
      :host([wrap]) .ds-checkrow {
        align-items: flex-start;
        padding: var(--ds-space-3);
      }
      :host([wrap]) .ds-checkrow__box {
        margin-top: 1px;
      }
      :host([wrap]) .ds-checkrow__name {
        font-weight: var(--ds-weight-semibold);
        line-height: 1.4;
        white-space: normal;
      }
      .ds-checkrow__eyebrow {
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--ds-text-meta);
      }
      .ds-checkrow:not(.is-done) .ds-checkrow__eyebrow {
        color: var(--ds-primary-soft-text);
      }
      .ds-checkrow__head {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
      }
      .ds-checkrow__chip {
        border-radius: var(--ds-radius-pill);
        padding: 0.125rem var(--ds-space-2);
        background: var(--ds-surface);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
    `,
  ],
  host: {
    "[attr.wrap]": "wrap ? '' : null",
  },
})
export class CheckRowComponent {
  @Input() name = "";
  @Input() meta = "";
  @Input() emoji = "";
  @Input() eyebrow = "";
  @Input() chip = "";
  @Input() wrap = false;
  @Input() checked = false;

  @Output() toggled = new EventEmitter<void>();
}
