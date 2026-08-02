import { Component, Input } from "@angular/core";

export type SkeletonListItemTrailing =
  | "none"
  | "pill"
  | "stack"
  | "actions"
  | "button";

@Component({
  selector: "ds-skeleton-list-item",
  templateUrl: "./skeleton-list-item.component.html",
  styleUrls: ["./skeleton-list-item.component.css"],
  host: {
    "[style.--skli-padding]": "padding",
    "[style.--skli-radius]": "radius",
    "[style.--skli-check.px]": "checkSize",
    "[style.--skli-tile.px]": "tile",
    "[style.--skli-tile-radius.px]": "tileRadius",
    "[style.--skli-title]": "titleWidth",
    "[style.--skli-title-h]": "titleHeight",
    "[style.--skli-head-trailing]": "headTrailing",
    "[style.--skli-meta]": "metaWidth",
    "[style.--skli-pill-w]": "pillWidth",
    "[style.--skli-pill-h]": "pillHeight",
    "[style.--ds-sk-delay]": "delay",
  },
})
export class SkeletonListItemComponent {
  @Input() padding = "10px 11px";
  @Input() radius = "16px";
  @Input() surface = true;
  @Input() tone: "surface" | "brand" = "surface";
  @Input() alignTop = false;

  @Input() check = false;
  @Input() checkSize = 26;

  @Input() tile = 0;
  @Input() tileRadius = 12;

  @Input() titleWidth = "58%";
  @Input() titleHeight = "13px";
  @Input() headTrailing = "";

  @Input() meta = true;
  @Input() metaWidth = "38%";

  @Input() chips = 0;

  @Input() trailing: SkeletonListItemTrailing = "none";
  @Input() actions = 2;
  @Input() pillWidth = "78px";
  @Input() pillHeight = "30px";

  @Input() progress = false;
  @Input() footButton = false;
  @Input() footItems = 0;

  @Input() delay = "0s";

  get chipArray(): number[] {
    return Array.from({ length: this.chips }, (_, index) => index);
  }

  get actionArray(): number[] {
    return Array.from({ length: this.actions }, (_, index) => index);
  }

  get footArray(): number[] {
    return Array.from({ length: this.footItems }, (_, index) => index);
  }
}
