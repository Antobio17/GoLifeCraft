import { Component, Input, computed, input } from "@angular/core";

export type SkeletonSummaryMacros = "none" | "bars" | "tiles";

@Component({
  selector: "ds-skeleton-summary",
  templateUrl: "./skeleton-summary.component.html",
  styleUrls: ["./skeleton-summary.component.css"],
  host: {
    "[style.--sksum-main-top]": "head ? '13px' : '0px'",
  },
})
export class SkeletonSummaryComponent {
  @Input() tone: "surface" | "soft" | "brand" | "primary" = "surface";
  @Input() head = true;
  @Input() ring = true;
  @Input() mainAside = false;
  @Input() macros: SkeletonSummaryMacros = "bars";
  @Input() progress = false;
  @Input() compact = false;
  readonly stats = input(0);

  readonly macroArray: number[] = [0, 1, 2];

  readonly statArray = computed<number[]>(() =>
    Array.from({ length: this.stats() }, (_, index) => index),
  );
}
