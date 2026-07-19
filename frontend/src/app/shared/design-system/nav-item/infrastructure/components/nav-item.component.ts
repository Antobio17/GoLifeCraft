import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { ChipComponent } from "../../../chip/infrastructure/components/chip.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-nav-item",
  standalone: true,
  imports: [IconComponent, ChipComponent],
  template: `
    <span class="item">
      <ds-icon
        class="item__icon"
        [name]="icon"
        [size]="sub ? 18 : 19"
        [stroke]="2.1"
      />
      <span class="item__label">{{ label }}</span>
      @if (badge) {
        <ds-chip class="item__badge" [uppercase]="true">{{ badge }}</ds-chip>
      }
    </span>
  `,
  styles: [
    `
      :host {
        display: block;
        cursor: pointer;
      }
      .item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 11px 13px;
        border-radius: 13px;
        color: var(--ds-text);
        font-family: inherit;
        font-size: 14px;
        font-weight: 600;
        transition:
          background var(--ds-transition-base),
          color var(--ds-transition-base);
      }
      .item__label {
        flex: 1 1 auto;
      }
      .item__icon {
        flex: none;
      }
      .item__badge {
        flex: none;
        --chip-pad: 2px 7px;
        --chip-radius: 999px;
        --chip-bg: color-mix(in srgb, var(--ds-accent) 18%, transparent);
        --chip-text: var(--ds-accent-soft-text);
      }
      :host(.is-active) .item__badge {
        --chip-bg: color-mix(
          in srgb,
          var(--drawer-active-fg, var(--ds-on-primary)) 22%,
          transparent
        );
        --chip-text: var(--drawer-active-fg, var(--ds-on-primary));
      }
      :host(.is-sub) .item {
        padding-left: 27px;
        font-size: 13.5px;
      }
      :host(.is-sub) .item__icon {
        color: var(--ds-text-meta);
      }
      :host(:hover) .item {
        background: color-mix(in srgb, var(--ds-text) 6%, transparent);
      }
      :host(.is-active) .item {
        background: var(--drawer-active-bg, var(--ds-primary));
        color: var(--drawer-active-fg, var(--ds-on-primary));
        font-weight: 700;
      }
      :host(.is-active) .item__icon {
        color: var(--drawer-active-icon, var(--ds-accent));
      }
    `,
  ],
  host: {
    "[class.is-sub]": "sub",
  },
})
export class NavItemComponent {
  @Input({ required: true }) icon!: DsIconName;
  @Input() label = "";
  @Input() sub = false;
  @Input() badge = "";
}
