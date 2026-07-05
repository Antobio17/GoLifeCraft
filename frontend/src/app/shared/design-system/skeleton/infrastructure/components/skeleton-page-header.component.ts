import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-page-header",
  templateUrl: "./skeleton-page-header.component.html",
  styleUrls: ["./skeleton-page-header.component.css"],
})
export class SkeletonPageHeaderComponent {
  @Input() showIcon: boolean = true;
  @Input() showEyebrow: boolean = false;
  @Input() showStats: boolean = false;
  @Input() showAction: boolean = true;
}
