import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconBadgeComponent } from "@shared/design-system/icon-badge/infrastructure/components/icon-badge.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";

@Component({
  selector: "ds-choice-row",
  imports: [IconBadgeComponent, IconComponent],
  template: `
    <button
      type="button"
      class="ds-choicerow"
      [attr.role]="selectable ? 'radio' : null"
      [attr.aria-checked]="selectable ? selected : null"
      [disabled]="disabled"
      (click)="activated.emit()"
    >
      @if (selectable) {
        <span class="ds-choicerow__radio">
          <ds-icon name="check" [size]="14" [stroke]="3" />
        </span>
      } @else if (icon) {
        <ds-icon-badge [icon]="icon" tone="brand" [size]="46" [iconSize]="21" />
      } @else {
        <span class="ds-choicerow__emoji">{{ emoji }}</span>
      }
      <span class="ds-choicerow__text">
        <span class="ds-choicerow__title">{{ title }}</span>
        <span class="ds-choicerow__description">{{ description }}</span>
      </span>
      @if (badge) {
        <span class="ds-choicerow__badge">{{ badge }}</span>
      } @else if (!selectable) {
        <svg
          class="ds-choicerow__chevron"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      }
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-choicerow {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        width: 100%;
        text-align: left;
        appearance: none;
        cursor: pointer;
        background: var(--ds-surface-inset);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-xl);
        padding: var(--ds-space-3);
        font: inherit;
        color: inherit;
        transition: border-color var(--ds-transition-fast);
      }
      .ds-choicerow:hover:not(:disabled) {
        border-color: var(--ds-border-strong);
      }
      .ds-choicerow:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .ds-choicerow__emoji {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.875rem;
        height: 2.875rem;
        border-radius: var(--ds-radius-lg);
        background: var(--ds-primary-soft);
        font-size: var(--ds-text-2xl);
      }
      .ds-choicerow__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ds-choicerow__title {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-lg);
        font-weight: 800;
      }
      .ds-choicerow__description {
        font-size: var(--ds-text-sm);
        line-height: 1.4;
        color: var(--ds-text-muted);
      }
      .ds-choicerow__chevron {
        flex: 0 0 auto;
        color: var(--ds-text-meta);
      }
      :host([selectable]) .ds-choicerow {
        background: var(--ds-surface);
        border-width: 1.5px;
        border-radius: var(--ds-radius-lg);
        align-items: flex-start;
      }
      :host([selected]) .ds-choicerow {
        background: var(--ds-primary-soft);
        border-color: var(--ds-primary);
      }
      .ds-choicerow__radio {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.625rem;
        height: 1.625rem;
        border-radius: 50%;
        background: var(--ds-surface);
        border: 1.5px solid var(--ds-border-strong);
        color: transparent;
        transition:
          background var(--ds-transition-fast),
          color var(--ds-transition-fast);
      }
      :host([selected]) .ds-choicerow__radio {
        background: var(--ds-primary);
        border-color: var(--ds-primary);
        color: var(--ds-on-primary);
      }
      :host([selectable]) .ds-choicerow__title {
        font-family: var(--ds-font-body);
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
      }
      :host([selected]) .ds-choicerow__title {
        color: var(--ds-primary-soft-text);
      }
      :host([selected]) .ds-choicerow__description {
        color: var(--ds-primary-soft-text);
        opacity: 0.85;
      }
      .ds-choicerow__badge {
        flex: 0 0 auto;
        border-radius: var(--ds-radius-pill);
        padding: 0.25rem var(--ds-space-2);
        background: var(--ds-surface);
        color: var(--ds-primary-soft-text);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
      }
    `,
  ],
  host: {
    "[attr.selectable]": "selectable ? '' : null",
    "[attr.selected]": "selectable && selected ? '' : null",
  },
})
export class ChoiceRowComponent {
  @Input() emoji = "";
  @Input() icon?: DsIconName;
  @Input() title = "";
  @Input() description = "";
  @Input() disabled = false;
  @Input() selectable = false;
  @Input() selected = false;
  @Input() badge = "";

  @Output() activated = new EventEmitter<void>();
}
