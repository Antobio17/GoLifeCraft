import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-empty-state",
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="ds-empty">
      @if (icon) {
        <span class="ds-empty__icon">
          <ds-icon [name]="icon" [size]="34" [stroke]="1.8" />
        </span>
      }
      <p class="ds-empty__title">{{ title }}</p>
      @if (text) {
        <p class="ds-empty__text">{{ text }}</p>
      }
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .ds-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        text-align: center;
        padding: 40px 24px;
      }
      .ds-empty__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        margin-bottom: 4px;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
        color: var(--ds-text-meta);
      }
      .ds-empty__title {
        margin: 0;
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text);
      }
      .ds-empty__text {
        margin: 0;
        max-width: 34ch;
        font-size: var(--ds-text-base);
        color: var(--ds-text-muted);
        line-height: 1.5;
      }
      .ds-empty ::ng-deep > *:last-child {
        margin-top: 8px;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon?: DsIconName;
  @Input() title = "";
  @Input() text = "";
}
