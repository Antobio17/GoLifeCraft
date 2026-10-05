import { NgTemplateOutlet } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-check-row",
  imports: [NgTemplateOutlet, IconComponent],
  template: `
    @if (openLabel) {
      <div
        class="ds-checkrow ds-checkrow--split"
        [class.is-off]="!checked"
        [class.is-done]="checked"
      >
        <button
          type="button"
          class="ds-checkrow__toggle"
          role="checkbox"
          [attr.aria-checked]="checked"
          [attr.aria-label]="name"
          (click)="toggled.emit()"
        >
          <ng-container [ngTemplateOutlet]="lead" />
        </button>
        <button
          type="button"
          class="ds-checkrow__open"
          [attr.aria-label]="openLabel + ': ' + name"
          (click)="opened.emit()"
        >
          <ng-container [ngTemplateOutlet]="text" />
          <ds-icon
            class="ds-checkrow__chevron"
            name="chevronRight"
            [size]="16"
            [stroke]="2.4"
          />
        </button>
      </div>
    } @else {
      <button
        type="button"
        class="ds-checkrow"
        role="checkbox"
        [class.is-off]="!checked"
        [class.is-done]="checked"
        [attr.aria-checked]="checked"
        (click)="toggled.emit()"
      >
        <ng-container [ngTemplateOutlet]="lead" />
        <ng-container [ngTemplateOutlet]="text" />
      </button>
    }

    <ng-template #lead>
      <span class="ds-checkrow__box" [class.is-on]="checked">
        <ds-icon name="check" [size]="15" [stroke]="3" />
      </span>
      @if (imageUrl && !imageFailed) {
        <img
          class="ds-checkrow__emoji ds-checkrow__image"
          [src]="imageUrl"
          [alt]="name"
          loading="lazy"
          decoding="async"
          (error)="imageFailed = true"
        />
      } @else if (emoji) {
        <span class="ds-checkrow__emoji">{{ emoji }}</span>
      }
    </ng-template>

    <ng-template #text>
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
    </ng-template>
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
      .ds-checkrow.is-off {
        opacity: 0.5;
      }
      :host([dim-checked]) .ds-checkrow.is-off {
        opacity: 1;
      }
      :host([dim-checked]) .ds-checkrow.is-done {
        opacity: 0.5;
      }
      .ds-checkrow--split {
        cursor: default;
        padding: 0;
        gap: 0;
      }
      .ds-checkrow__toggle,
      .ds-checkrow__open {
        appearance: none;
        border: none;
        background: none;
        font: inherit;
        color: inherit;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        text-align: left;
      }
      .ds-checkrow__toggle {
        flex: 0 0 auto;
        align-self: stretch;
        padding: var(--ds-space-2) 0 var(--ds-space-2) var(--ds-space-3);
      }
      .ds-checkrow__open {
        flex: 1 1 auto;
        min-width: 0;
        padding: var(--ds-space-2) var(--ds-space-3);
        border-radius: 0 var(--ds-radius-lg) var(--ds-radius-lg) 0;
      }
      .ds-checkrow__chevron {
        flex: 0 0 auto;
        color: var(--ds-text-meta);
      }
      .ds-checkrow__toggle:focus-visible,
      .ds-checkrow__open:focus-visible {
        outline: 2px solid var(--ds-primary);
        outline-offset: -2px;
        border-radius: var(--ds-radius-lg);
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
      .ds-checkrow__image {
        object-fit: cover;
        overflow: hidden;
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
        line-height: 1.25;
        overflow-wrap: anywhere;
      }
      .ds-checkrow__meta {
        font-size: var(--ds-text-xs);
        color: var(--ds-text-muted);
      }
      :host([wrap]) .ds-checkrow:not(.ds-checkrow--split) {
        align-items: flex-start;
        padding: var(--ds-space-3);
      }
      :host([wrap]) .ds-checkrow__box {
        margin-top: 1px;
      }
      :host([wrap]) .ds-checkrow__name {
        font-weight: var(--ds-weight-semibold);
        line-height: 1.4;
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
    "[attr.dim-checked]": "dimChecked ? '' : null",
  },
})
export class CheckRowComponent {
  @Input() name = "";
  @Input() meta = "";
  @Input() emoji = "";
  @Input() eyebrow = "";

  @Input()
  set imageUrl(value: string | null) {
    if (value === this.currentImageUrl) return;

    this.currentImageUrl = value;
    this.imageFailed = false;
  }

  get imageUrl(): string | null {
    return this.currentImageUrl;
  }

  private currentImageUrl: string | null = null;
  imageFailed = false;

  @Input() chip = "";
  @Input() wrap = false;
  @Input() dimChecked = false;
  @Input() checked = false;

  @Input() openLabel = "";

  @Output() toggled = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
}
