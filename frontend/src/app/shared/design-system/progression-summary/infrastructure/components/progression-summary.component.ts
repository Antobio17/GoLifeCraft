import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-progression-summary",
  imports: [IconComponent],
  template: `
    <div class="ps">
      <ds-icon class="ps__icon" name="chart" [size]="16" [stroke]="2.2" />
      <span class="ps__text">{{ text }}</span>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ps {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        padding-top: var(--ds-space-2);
        border-top: 1px solid var(--ds-border-hairline);
      }
      .ps__icon {
        flex: 0 0 auto;
        color: var(--ds-primary);
      }
      .ps__text {
        min-width: 0;
        font-family: var(--ds-font-body);
        font-size: var(--ds-text-base);
        color: var(--ds-text-meta);
      }
    `,
  ],
})
export class ProgressionSummaryComponent {
  @Input() text = "";
}
