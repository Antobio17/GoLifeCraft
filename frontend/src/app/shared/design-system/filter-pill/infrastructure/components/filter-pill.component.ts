import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-filter-pill",
  imports: [IconComponent],
  template: `
    <span class="ds-filter-pill">
      <span class="ds-filter-pill__label"><ng-content></ng-content></span>
      <button
        type="button"
        class="ds-filter-pill__remove"
        [attr.aria-label]="removeLabel"
        (click)="removed.emit()"
      >
        <ds-icon name="close" [size]="13" [stroke]="2.4" />
      </button>
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        min-width: 0;
      }
      .ds-filter-pill {
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-1);
        min-width: 0;
        height: 1.875rem;
        padding: 0 var(--ds-space-1) 0 var(--ds-space-3);
        border-radius: var(--ds-radius-pill);
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
        box-shadow: inset 0 0 0 1px var(--ds-primary-soft-border);
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
      }
      .ds-filter-pill__label {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .ds-filter-pill__remove {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: none;
        width: 1.375rem;
        height: 1.375rem;
        padding: 0;
        border: none;
        border-radius: var(--ds-radius-pill);
        background: transparent;
        color: inherit;
        cursor: pointer;
        transition: background var(--ds-transition-fast);
      }
      .ds-filter-pill__remove:hover {
        background: var(--ds-primary-soft-hover);
      }
      .ds-filter-pill__remove::after {
        content: "";
        position: absolute;
        inset: calc(var(--ds-space-1) * -1);
      }
    `,
  ],
})
export class FilterPillComponent {
  @Input() removeLabel = "";

  @Output() removed = new EventEmitter<void>();
}
