import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-meta-item",
  standalone: true,
  imports: [IconComponent],
  template: `
    <span class="ds-meta-item">
      <ds-icon class="ds-meta-item__icon" [name]="icon" [size]="size" />
      <ng-content></ng-content>
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .ds-meta-item {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11.5px;
        font-weight: 600;
        color: var(--ds-text-muted);
      }
      .ds-meta-item__icon {
        color: var(--ds-primary);
        flex: 0 0 auto;
      }
    `,
  ],
})
export class MetaItemComponent {
  @Input() icon!: DsIconName;
  @Input() size = 14;
}
