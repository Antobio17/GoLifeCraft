import { Component, Input } from "@angular/core";
import { BarTone } from "../../../bar/domain/models/bar-tone.enum";

@Component({
  selector: "ds-progress-ring",
  templateUrl: "./progress-ring.component.html",
  styleUrls: ["./progress-ring.component.css"],
})
export class ProgressRingComponent {
  @Input() value = 0;
  @Input() size = 66;
  @Input() hollow = false;
  @Input() soft = false;
  @Input() tone: `${BarTone}` | "" = "";

  get clamped(): number {
    return Math.max(0, Math.min(100, this.value));
  }

  get fill(): string | null {
    if (!this.tone) {
      return null;
    }

    return `var(--ds-bar-${this.tone})`;
  }
}
