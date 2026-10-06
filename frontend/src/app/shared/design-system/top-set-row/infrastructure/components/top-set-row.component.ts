import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";

@Component({
  selector: "ds-top-set-row",
  imports: [IconComponent, IconButtonComponent, SkeletonLineComponent],
  template: `
    <div
      class="ds-tsr"
      [class.ds-tsr--filled]="!!value && !loading"
      [class.ds-tsr--subtle]="subtle"
    >
      <span class="ds-tsr__badge">
        <ds-icon name="weightPlate" [size]="15" [stroke]="1.9" />
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
        border-radius: var(--ds-radius-inner);
        padding: var(--ds-space-1-5) var(--ds-space-2) var(--ds-space-1-5)
          var(--ds-space-2);
        transition: background var(--ds-dur-2) var(--ds-ease-out);
      }
      .ds-tsr--filled {
        background: var(--ds-warning-soft);
      }
      .ds-tsr__badge {
        width: 1.875rem;
        height: 1.875rem;
        flex: 0 0 auto;
        border-radius: var(--ds-radius-tag);
        background: var(--ds-surface);
        color: var(--ds-text-muted);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .ds-tsr--filled .ds-tsr__badge {
        background: color-mix(in srgb, var(--ds-warning) 18%, transparent);
        color: var(--ds-warning);
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
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--ds-text-muted);
      }
      .ds-tsr--filled .ds-tsr__label {
        color: var(--ds-warning);
      }
      .ds-tsr__value {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        font-variant-numeric: tabular-nums;
        color: var(--ds-text);
      }
      .ds-tsr__caption {
        font-family: var(--ds-font-body);
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
      .ds-tsr__empty {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
      .ds-tsr__action {
        flex: 0 0 auto;
        --icon-btn-color: var(--ds-primary-soft-text);
      }
      .ds-tsr--subtle {
        gap: var(--ds-space-1-5);
        padding: 0 var(--ds-space-1);
        background: transparent;
      }
      .ds-tsr--subtle .ds-tsr__badge {
        width: auto;
        height: auto;
        background: transparent;
        color: var(--ds-text-muted);
      }
      .ds-tsr--subtle.ds-tsr--filled .ds-tsr__badge {
        background: transparent;
        color: var(--ds-warning);
        opacity: 0.8;
      }
      .ds-tsr--subtle .ds-tsr__text {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: baseline;
        column-gap: var(--ds-space-1-5);
      }
      .ds-tsr--subtle .ds-tsr__label,
      .ds-tsr--subtle.ds-tsr--filled .ds-tsr__label {
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-medium);
        letter-spacing: 0;
        text-transform: none;
        color: var(--ds-text-muted);
      }
      .ds-tsr--subtle .ds-tsr__value {
        font-size: var(--ds-text-base);
      }
      .ds-tsr--subtle .ds-tsr__empty {
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-medium);
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
  @Input() subtle = false;

  @Output() actionClicked = new EventEmitter<void>();
}
