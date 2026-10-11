import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-budget",
  templateUrl: "./skeleton-budget.component.html",
  styleUrls: ["./skeleton-budget.component.css"],
})
export class SkeletonBudgetComponent {
  @Input() ringSize = "3.75rem";
}
