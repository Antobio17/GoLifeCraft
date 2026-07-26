import { Component, Input } from "@angular/core";

export type SkeletonSummaryMacros = "none" | "bars" | "tiles";

@Component({
  selector: "ds-skeleton-summary",
  standalone: true,
  templateUrl: "./skeleton-summary.component.html",
  styleUrls: ["./skeleton-summary.component.css"],
  host: {
    "[style.--sksum-main-top]": "head ? '13px' : '0px'",
  },
})
export class SkeletonSummaryComponent {
  @Input() tone: "brand" | "primary" = "brand";
  @Input() head = true;
  @Input() ring = true;
  @Input() mainAside = false;
  @Input() macros: SkeletonSummaryMacros = "bars";
  @Input() progress = false;
  @Input() compact = false;
  @Input() stats = 0;

  get macroArray(): number[] {
    return [0, 1, 2];
  }

  get statArray(): number[] {
    return Array.from({ length: this.stats }, (_, index) => index);
  }
}
