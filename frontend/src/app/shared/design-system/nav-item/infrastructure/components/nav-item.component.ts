import { NgTemplateOutlet } from "@angular/common";
import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { ChipComponent } from "../../../chip/infrastructure/components/chip.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-nav-item",
  imports: [IconComponent, ChipComponent, NgTemplateOutlet],
  template: `
    <ng-template #content>
      <ds-icon
        class="item__icon"
        [name]="icon"
        [size]="sub ? 18 : 19"
        [stroke]="2.1"
      />
      <span class="item__label">{{ label }}</span>
      @if (href && external) {
        <ds-icon
          class="item__external"
          name="externalLink"
          [size]="14"
          [stroke]="2.1"
        />
      }
      @if (badge) {
        <ds-chip class="item__badge" [uppercase]="true">{{ badge }}</ds-chip>
      }
    </ng-template>

    @if (href) {
      <a
        class="item"
        [href]="href"
        [attr.target]="external ? '_blank' : null"
        [attr.rel]="external ? 'noopener noreferrer' : null"
      >
        <ng-container [ngTemplateOutlet]="content" />
      </a>
    } @else {
      <span class="item">
        <ng-container [ngTemplateOutlet]="content" />
      </span>
    }
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
        gap: var(--ds-space-3);
        width: 100%;
        padding: var(--ds-space-3);
        border-radius: var(--ds-radius-lg);
        color: var(--ds-text);
        font-family: inherit;
        font-size: var(--ds-text-md);
        font-weight: 600;
        transition:
          background var(--ds-transition-base),
          color var(--ds-transition-base);
      }
      a.item {
        text-decoration: none;
        color: inherit;
      }
      .item__label {
        flex: 1 1 auto;
      }
      .item__external {
        flex: none;
        color: var(--ds-text-meta);
      }
      .item__icon {
        flex: none;
      }
      .item__badge {
        flex: none;
        --chip-pad: 2px 0.4375rem;
        --chip-radius: var(--ds-radius-pill);
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
        padding-left: var(--ds-space-6);
        font-size: var(--ds-text-md);
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
  @Input() href = "";
  @Input() external = true;
}
