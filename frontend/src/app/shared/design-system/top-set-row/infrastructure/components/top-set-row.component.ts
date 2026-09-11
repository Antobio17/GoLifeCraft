import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";

@Component({
  selector: "ds-top-set-row",
  imports: [IconComponent, IconButtonComponent, SkeletonLineComponent],
  template: `
    <div class="ds-tsr">
      <span class="ds-tsr__badge">
        <ds-icon name="weightPlate" [size]="17" [stroke]="1.9" />
      </span>

      <span class="ds-tsr__text">
        <span class="ds-tsr__label">{{ label }}</span>
        @if (loading) {
          <ds-skeleton-line width="7rem" height="0.875rem" />
        } @else if (value) {
          <span class="ds-tsr__value">
            {{ value }}
            @if (caption) {
              <span class="ds-tsr__caption">· {{ caption }}</span>
            }
          </span>
        } @else {
          <span class="ds-tsr__empty">{{ emptyText }}</span>
        }
      </span>

      @if (showAction) {
        <ds-icon-button
          class="ds-tsr__action"
          icon="externalLink"
          [size]="32"
          [iconSize]="16"
          [ariaLabel]="actionAriaLabel"
          (clicked)="actionClicked.emit()"
        />
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-tsr {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        background: var(--ds-surface-inset);
        border-radius: var(--ds-radius-lg);
        padding: var(--ds-space-2);
      }
      .ds-tsr__badge {
        width: 1.875rem;
        height: 1.875rem;
        flex: 0 0 auto;
        border-radius: var(--ds-radius-sm);
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .ds-tsr__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ds-tsr__label {
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--ds-text-meta);
      }
      .ds-tsr__value {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text);
      }
      .ds-tsr__caption {
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
      .ds-tsr__empty {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
      .ds-tsr__action {
        flex: 0 0 auto;
        --icon-btn-color: var(--ds-primary-soft-text);
      }
    `,
  ],
})
export class TopSetRowComponent {
  @Input() label = "";
  @Input() value = "";
  @Input() caption = "";
  @Input() emptyText = "";
  @Input() showAction = false;
  @Input() actionAriaLabel = "";
  @Input() loading = false;

  @Output() actionClicked = new EventEmitter<void>();
}
