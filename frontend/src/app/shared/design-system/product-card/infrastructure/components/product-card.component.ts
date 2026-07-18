import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { ProductBadge } from "../../domain/models/product-badge.model";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-product-card",
  standalone: true,
  imports: [NgTemplateOutlet, IconComponent],
  template: `
    <ng-template #content>
      <span class="ds-pcard__emoji">{{ emoji }}</span>
      <span class="ds-pcard__body">
        <span class="ds-pcard__head">
          <span class="ds-pcard__name">{{ name }}</span>
          @if (price) {
            <span class="ds-pcard__price">{{ price }}</span>
          }
        </span>
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
        @if (visibleBadges.length > 0) {
          <span class="ds-pcard__badges">
            @for (badge of visibleBadges; track badge.text) {
              <span
                class="ds-pcard__badge"
                [class.ds-pcard__badge--kcal]="badge.kcal"
                >{{ badge.text }}</span
              >
            }
          </span>
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
        display: block;
      }
      .ds-pcard {
        display: flex;
        gap: 11px;
        width: 100%;
        text-align: left;
        appearance: none;
        font: inherit;
        color: inherit;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: 16px;
        padding: 10px;
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
        gap: 5px;
        appearance: none;
        font: inherit;
        font-size: 12px;
        font-weight: 800;
        color: var(--ds-on-primary);
        background: var(--ds-primary);
        border: none;
        border-radius: 11px;
        padding: 8px 11px;
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
        width: 56px;
        height: 56px;
        flex: 0 0 auto;
        border-radius: 12px;
        background: var(--ds-surface-inset);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
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
        gap: 8px;
      }
      .ds-pcard__name {
        font-size: 13.5px;
        font-weight: 700;
        line-height: 1.2;
        color: var(--ds-text);
      }
      .ds-pcard__price {
        font-size: 13.5px;
        font-weight: 800;
        color: var(--ds-primary);
        white-space: nowrap;
      }
      .ds-pcard__meta {
        display: block;
        font-size: 11px;
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
        display: flex;
        gap: 5px;
        margin-top: 8px;
        flex-wrap: wrap;
      }
      .ds-pcard__badge {
        background: var(--ds-surface-inset);
        border-radius: 7px;
        padding: 3px 6px;
        font-size: 10.5px;
        font-weight: 600;
        color: var(--ds-text-muted);
      }
      .ds-pcard__badge--kcal {
        background: var(--ds-accent);
        color: var(--ds-on-accent);
        font-weight: 800;
      }
    `,
  ],
})
export class ProductCardComponent {
  @Input() emoji = "";
  @Input() name = "";
  @Input() price: string | null = null;
  @Input() brand: string | null = null;
  @Input() store: string | null = null;
  @Input() badges: ProductBadge[] = [];
  @Input() actionable = false;
  @Input() added = false;
  @Input() pending = false;
  @Input() actionLabel = "";
  @Input() addedLabel = "";

  @Output() activated = new EventEmitter<void>();
  @Output() action = new EventEmitter<void>();

  get visibleBadges(): ProductBadge[] {
    return this.badges.filter((badge) => !badge.hidden);
  }

  get actionCaption(): string {
    return this.added ? this.addedLabel : this.actionLabel;
  }
}
