import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-progression-summary",
  imports: [IconComponent],
  template: `
    <div class="ps">
      <ds-icon class="ps__icon" name="chart" [size]="14" [stroke]="2" />
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
        gap: var(--ds-space-1-5);
        padding: 0 var(--ds-space-1);
      }
      .ps__icon {
        flex: 0 0 auto;
        color: var(--ds-primary-soft-text);
        opacity: 0.8;
      }
      .ps__text {
        min-width: 0;
        font-family: var(--ds-font-body);
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-medium);
        color: var(--ds-text-muted);
      }
    `,
  ],
})
export class ProgressionSummaryComponent {
  @Input() text = "";
}
