import { Component, Input } from "@angular/core";
import { BarComponent } from "../../../bar/infrastructure/components/bar.component";

export type BudgetMeterTone = "positive" | "warning" | "danger";

@Component({
  selector: "ds-budget-meter",
  imports: [BarComponent],
  template: `
    <ds-bar
      [value]="ratio * 100"
      [pace]="showPace ? paceRatio * 100 : null"
      [tone]="tone"
      [ariaLabel]="ariaLabel"
    />
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class BudgetMeterComponent {
  @Input() ratio = 0;
  @Input() paceRatio = 0;
  @Input() tone: BudgetMeterTone = "positive";
  @Input() showPace = true;
  @Input() ariaLabel = "";
}
