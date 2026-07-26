import { Component, Input } from "@angular/core";

export type SkeletonPanelContent = "none" | "bars" | "meters" | "spark";

@Component({
  selector: "ds-skeleton-panel",
  standalone: true,
  templateUrl: "./skeleton-panel.component.html",
  styleUrls: ["./skeleton-panel.component.css"],
})
export class SkeletonPanelComponent {
  @Input() brand = false;
  @Input() subtitle = true;
  @Input() figure = false;
  @Input() content: SkeletonPanelContent = "bars";
  @Input() chartHeight = "108px";
  @Input() bars = 7;
  @Input() meters = 4;

  get barArray(): number[] {
    return Array.from({ length: this.bars }, (_, index) => index);
  }

  get meterArray(): number[] {
    return Array.from({ length: this.meters }, (_, index) => index);
  }
}
