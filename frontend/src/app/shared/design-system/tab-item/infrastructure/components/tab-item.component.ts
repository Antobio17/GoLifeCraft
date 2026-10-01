import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-tab-item",
  imports: [IconComponent],
  template: `
    <span class="tab" [class.tab--active]="active">
      <ds-icon [name]="icon" [size]="24" [stroke]="active ? 2.1 : 1.8" />
    </span>
  `,
  styles: [
    `
      :host {
        display: block;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .tab {
        position: relative;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 3.25rem;
        height: 3rem;
        border-radius: var(--ds-radius-pill);
        color: var(--ds-text-meta);
        transition:
          color var(--ds-dur-2) var(--ds-ease-out),
          transform var(--ds-dur-1) var(--ds-ease-out);
      }
      .tab ds-icon ::ng-deep svg {
        fill: transparent;
        transition: fill var(--ds-dur-2) var(--ds-ease-out);
      }
      :host(:hover) .tab:not(.tab--active) {
        color: var(--ds-text-muted);
      }
      :host(:active) .tab {
        transform: scale(0.88);
      }
      :host(:focus-visible) {
        outline: none;
      }
      :host(:focus-visible) .tab {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: -2px;
      }
      .tab--active {
        color: var(--ds-primary);
      }
      .tab--active ds-icon ::ng-deep svg {
        fill: color-mix(in srgb, currentColor 22%, transparent);
      }
      @media (prefers-reduced-motion: reduce) {
        .tab,
        .tab ds-icon ::ng-deep svg {
          transition: none;
        }
      }
    `,
  ],
})
export class TabItemComponent {
  @Input({ required: true }) icon!: DsIconName;
  @Input() active = false;
}
