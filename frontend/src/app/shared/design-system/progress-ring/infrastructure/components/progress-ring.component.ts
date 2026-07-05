import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-progress-ring",
  standalone: true,
  templateUrl: "./progress-ring.component.html",
  styleUrls: ["./progress-ring.component.css"],
})
export class ProgressRingComponent {
  @Input() value = 0;
  @Input() size = 66;

  get clamped(): number {
    return Math.max(0, Math.min(100, this.value));
  }
}
