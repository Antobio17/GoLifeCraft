import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { MacroBadgesComponent } from "../../../macro-badges/infrastructure/components/macro-badges.component";
import { MacroBadge } from "../../../macro-badges/domain/models/macro-badge.model";

@Component({
  selector: "ds-product-card",
  imports: [NgTemplateOutlet, IconComponent, MacroBadgesComponent],
  template: `
    <ng-template #content>
      <span class="ds-pcard__emoji">
        @if (imageUrl && !imageFailed) {
          <img
            class="ds-pcard__image"
            [src]="imageUrl"
            [alt]="name"
            loading="lazy"
            decoding="async"
            (error)="imageFailed = true"
          />
        } @else {
          {{ emoji }}
        }
      </span>
      <span class="ds-pcard__body">
        <span class="ds-pcard__head">
          <span class="ds-pcard__name">{{ name }}</span>
          @if (price) {
            <span class="ds-pcard__price">{{ price }}</span>
          }
        </span>
        @if (priceBelow) {
          <span class="ds-pcard__price-below">{{ priceBelow }}</span>
        }
        @if (brand || store) {
          <span class="ds-pcard__meta">
            @if (brand) {
              <span>{{ brand }}</span>
            }
            @if (brand && store) {
              <span> · </span>
            }
            @if (store) {
              <span class="ds-pcard__store">{{ store }}</span>
            }
          </span>
        }
        @if (hasBadges) {
          <ds-macro-badges
            class="ds-pcard__badges"
            [kcal]="kcal"
            [macros]="macros"
          />
        }
      </span>
    </ng-template>

    @if (actionable) {
      <div class="ds-pcard ds-pcard--static">
        <ng-container [ngTemplateOutlet]="content"></ng-container>
        <button
          type="button"
          class="ds-pcard__action"
          [class.ds-pcard__action--added]="added"
          [disabled]="pending || added"
          (click)="action.emit()"
        >
          @if (added) {
            <ds-icon name="check" [size]="14" [stroke]="2.6" />
          } @else {
            <ds-icon name="download" [size]="14" [stroke]="2.6" />
          }
          @if (actionCaption) {
            <span>{{ actionCaption }}</span>
          }
        </button>
      </div>
    } @else {
      <button type="button" class="ds-pcard" (click)="activated.emit()">
        <ng-container [ngTemplateOutlet]="content"></ng-container>
      </button>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
      }
      .ds-pcard {
        display: flex;
        gap: 0.6875rem;
        width: 100%;
        height: 100%;
        text-align: left;
        appearance: none;
        font: inherit;
        color: inherit;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: 1rem;
        padding: 0.625rem;
        cursor: pointer;
        transition:
          border-color 0.15s ease,
          background 0.15s ease;
      }
      button.ds-pcard:hover {
        border-color: var(--ds-border-strong);
        background: var(--ds-surface-hover);
      }
      .ds-pcard--static {
        cursor: default;
        align-items: center;
      }
      .ds-pcard__action {
        flex: 0 0 auto;
        align-self: center;
        display: inline-flex;
        align-items: center;
        gap: 0.3125rem;
        appearance: none;
        font: inherit;
        font-size: 0.75rem;
        font-weight: 800;
        color: var(--ds-on-primary);
        background: var(--ds-primary);
        border: none;
        border-radius: 0.6875rem;
        padding: 0.5rem 0.6875rem;
        cursor: pointer;
        transition:
          background 0.15s ease,
          color 0.15s ease;
      }
      .ds-pcard__action:disabled {
        cursor: default;
      }
      .ds-pcard__action--added {
        background: var(--ds-surface-inset);
        color: var(--ds-text-muted);
      }
      .ds-pcard__emoji {
        width: 3.5rem;
        height: 3.5rem;
        flex: 0 0 auto;
        border-radius: 0.75rem;
        background: var(--ds-surface-inset);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.625rem;
        overflow: hidden;
      }
      .ds-pcard__image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }
      .ds-pcard__body {
        flex: 1 1 auto;
        min-width: 0;
        display: block;
      }
      .ds-pcard__head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 0.5rem;
      }
      .ds-pcard__name {
        font-size: 0.84375rem;
        font-weight: 700;
        line-height: 1.2;
        color: var(--ds-text);
      }
      .ds-pcard__price {
        font-size: 0.84375rem;
        font-weight: 800;
        color: var(--ds-primary);
        white-space: nowrap;
      }
      .ds-pcard__price-below {
        display: block;
        font-size: 0.78125rem;
        font-weight: 800;
        color: var(--ds-primary);
        margin-top: 2px;
      }
      .ds-pcard__meta {
        display: block;
        font-size: 0.6875rem;
        color: var(--ds-text-muted);
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-pcard__store {
        color: var(--ds-warning);
        font-weight: 700;
      }
      .ds-pcard__badges {
        margin-top: 0.5rem;
      }
    `,
  ],
})
export class ProductCardComponent {
  @Input() emoji = "";
  @Input() name = "";

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

  @Input() price: string | null = null;
  @Input() priceBelow: string | null = null;
  @Input() brand: string | null = null;
  @Input() store: string | null = null;
  @Input() kcal = "";
  @Input() macros: MacroBadge[] = [];
  @Input() actionable = false;
  @Input() added = false;
  @Input() pending = false;
  @Input() actionLabel = "";
  @Input() addedLabel = "";

  @Output() activated = new EventEmitter<void>();
  @Output() action = new EventEmitter<void>();

  get hasBadges(): boolean {
    return !!this.kcal || this.macros.some((macro) => !!macro.value);
  }

  get actionCaption(): string {
    return this.added ? this.addedLabel : this.actionLabel;
  }
}
