import { Component, Input } from "@angular/core";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { TextComponent } from "@shared/design-system/text/infrastructure/components/text.component";
import { ProgressBarComponent } from "@shared/design-system/progress-bar/infrastructure/components/progress-bar.component";

@Component({
  selector: "ds-shopping-summary",
  standalone: true,
  templateUrl: "./shopping-summary.component.html",
  styleUrls: ["./shopping-summary.component.css"],
  imports: [StackComponent, TextComponent, ProgressBarComponent],
})
export class ShoppingSummaryComponent {
  @Input() eyebrow = "";
  @Input() totalLabel = "";
  @Input() boughtLabel = "";
  @Input() percent = 0;

  get clampedPercent(): number {
    return Math.min(100, Math.max(0, this.percent));
  }
}
