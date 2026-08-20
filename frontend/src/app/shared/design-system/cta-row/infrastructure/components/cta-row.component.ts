import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";

@Component({
  selector: "ds-cta-row",
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="ds-cta"
      [class.is-dashed]="dashed"
      (click)="clicked.emit()"
    >
      <span class="ds-cta__badge">
        <ds-icon [name]="icon" [size]="21" [stroke]="1.9" />
      </span>

      <span class="ds-cta__text">
        <span class="ds-cta__title">{{ title }}</span>
        @if (subtitle) {
          <span class="ds-cta__subtitle">{{ subtitle }}</span>
        }
      </span>

      <ds-icon name="chevronRight" [size]="20" [stroke]="2.4" />
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-cta {
        width: 100%;
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        background: var(--ds-surface-raised);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-xl);
        padding: var(--ds-space-4);
        cursor: pointer;
        text-align: left;
        font-family: var(--ds-font-body);
        color: var(--ds-text-meta);
        transition: transform var(--ds-transition-base);
      }
      .ds-cta.is-dashed {
        border-style: dashed;
        border-color: var(--ds-border-strong);
      }
      .ds-cta:active {
        transform: scale(0.99);
      }
      .ds-cta__badge {
        width: 2.5rem;
        height: 2.5rem;
        flex: 0 0 auto;
        border-radius: var(--ds-radius-lg);
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .ds-cta__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1);
      }
      .ds-cta__title {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-extrabold);
        color: var(--ds-text);
      }
      .ds-cta__subtitle {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
    `,
  ],
})
export class CtaRowComponent {
  @Input({ required: true }) icon!: DsIconName;
  @Input() title = "";
  @Input() subtitle = "";
  @Input() dashed = false;

  @Output() clicked = new EventEmitter<void>();
}
