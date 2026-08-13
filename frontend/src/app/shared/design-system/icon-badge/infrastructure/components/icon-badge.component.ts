import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

type IconBadgeTone = "neutral" | "brand" | "danger" | "success";

@Component({
  selector: "ds-icon-badge",
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
        width: var(--badge-size, 2.5rem);
        height: var(--badge-size, 2.5rem);
        border-radius: var(--ds-radius-lg);
        background: var(--badge-bg, var(--ds-surface-inset));
        color: var(--badge-color, var(--ds-text-body));
      }
      :host([tone="brand"]) .ds-icon-badge {
        --badge-bg: var(--ds-primary-soft);
        --badge-color: var(--ds-primary-soft-text);
      }
      :host([tone="danger"]) .ds-icon-badge {
        --badge-bg: var(--ds-danger-soft);
        --badge-color: var(--ds-danger);
      }
      :host([tone="success"]) .ds-icon-badge {
        --badge-bg: var(--ds-success-soft);
        --badge-color: var(--ds-success);
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
