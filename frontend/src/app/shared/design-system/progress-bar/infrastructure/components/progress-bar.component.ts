import { Component, Input } from "@angular/core";
import { BarComponent } from "../../../bar/infrastructure/components/bar.component";

@Component({
  selector: "ds-progress-bar",
  imports: [BarComponent],
  template: `<ds-bar [value]="value" [ariaLabel]="ariaLabel" />`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ProgressBarComponent {
  @Input() value = 0;
  @Input() ariaLabel = "";
}
