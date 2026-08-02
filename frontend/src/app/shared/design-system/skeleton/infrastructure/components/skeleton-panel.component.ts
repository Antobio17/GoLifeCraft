import { Component, Input } from "@angular/core";

export type SkeletonPanelContent = "none" | "heatmap" | "meters" | "spark";

@Component({
  selector: "ds-skeleton-panel",
  templateUrl: "./skeleton-panel.component.html",
  styleUrls: ["./skeleton-panel.component.css"],
})
export class SkeletonPanelComponent {
  @Input() brand = false;
  @Input() subtitle = true;
  @Input() figure = false;
  @Input() content: SkeletonPanelContent = "heatmap";
  @Input() chartHeight = "108px";
  @Input() heatmapCells = 112;
  @Input() meters = 4;

  get heatmapArray(): number[] {
    return Array.from({ length: this.heatmapCells }, (_, index) => index);
  }

  get meterArray(): number[] {
    return Array.from({ length: this.meters }, (_, index) => index);
  }
}
