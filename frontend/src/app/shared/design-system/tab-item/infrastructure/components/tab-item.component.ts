import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-tab-item",
  imports: [IconComponent],
  template: `
    <span class="tab" [class.tab--active]="active">
      <span class="tab__icon">
        <ds-icon [name]="icon" [size]="20" [stroke]="2.2" />
      </span>
      <span class="tab__label">{{ label }}</span>
    </span>
  `,
  styles: [
    `
      :host {
        flex: 1;
        display: block;
        cursor: pointer;
      }
      .tab {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        padding: 0.5625rem 0.375rem;
        border-radius: 0.875rem;
        color: var(--ds-text-meta);
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.6, 0.05, 0.28, 0.98);
      }
      .tab__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
      }
      .tab__label {
        max-width: 0;
        overflow: hidden;
        opacity: 0;
        font-size: 0.75rem;
        font-weight: 700;
        line-height: 1;
        white-space: nowrap;
        transition: all 0.3s cubic-bezier(0.6, 0.05, 0.28, 0.98);
      }
      .tab--active {
        color: var(--ds-text);
        background: var(--ds-surface-inset);
        padding: 0.5625rem 0.6875rem;
      }
      .tab--active .tab__label {
        max-width: 10rem;
        opacity: 1;
        padding-left: 0.4375rem;
      }
    `,
  ],
})
export class TabItemComponent {
  @Input({ required: true }) icon!: DsIconName;
  @Input() label = "";
  @Input() active = false;
}
