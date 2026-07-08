import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

type IconBadgeTone = "neutral" | "brand";

@Component({
  selector: "ds-icon-badge",
  standalone: true,
  imports: [IconComponent],
  template: `<span class="ds-icon-badge">
    <ds-icon [name]="icon" [size]="iconSize" [stroke]="2" />
  </span>`,
  styles: [
    `
      :host {
        display: inline-flex;
        flex: 0 0 auto;
      }
      .ds-icon-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--badge-size, 40px);
        height: var(--badge-size, 40px);
        border-radius: var(--ds-radius-xl);
        background: var(--badge-bg, var(--ds-surface-inset));
        color: var(--badge-color, var(--ds-text-body));
      }
      :host([tone="brand"]) .ds-icon-badge {
        --badge-bg: var(--ds-primary-soft);
        --badge-color: var(--ds-primary-soft-text);
      }
    `,
  ],
  host: {
    "[attr.tone]": "tone",
    "[style.--badge-size.px]": "size",
  },
})
export class IconBadgeComponent {
  @Input({ required: true }) icon!: DsIconName;
  @Input() tone: IconBadgeTone = "neutral";
  @Input() size = 40;
  @Input() iconSize = 17;
}
