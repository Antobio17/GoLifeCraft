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
        padding: var(--ds-space-2) var(--ds-space-1-5);
        border-radius: var(--ds-radius-lg);
        color: var(--ds-text-meta);
        text-decoration: none;
        transition:
          background var(--ds-dur-3) var(--ds-ease-out),
          color var(--ds-dur-2) var(--ds-ease-out),
          padding var(--ds-dur-3) var(--ds-ease-spring),
          transform var(--ds-dur-1) var(--ds-ease-out);
      }
      :host(:active) .tab {
        transform: scale(0.94);
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
        font-size: var(--ds-text-base);
        font-weight: 700;
        line-height: 1;
        white-space: nowrap;
        transition:
          max-width var(--ds-dur-3) var(--ds-ease-spring),
          padding-left var(--ds-dur-3) var(--ds-ease-spring),
          opacity var(--ds-dur-2) var(--ds-ease-out);
      }
      .tab--active {
        color: var(--ds-text);
        background: var(--ds-surface-inset);
        padding: var(--ds-space-2) var(--ds-space-3);
      }
      .tab--active .tab__label {
        max-width: 10rem;
        opacity: 1;
        padding-left: var(--ds-space-1-5);
      }
    `,
  ],
})
export class TabItemComponent {
  @Input({ required: true }) icon!: DsIconName;
  @Input() label = "";
  @Input() active = false;
}
