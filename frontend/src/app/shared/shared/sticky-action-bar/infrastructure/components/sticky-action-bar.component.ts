import { Component, Input } from "@angular/core";

@Component({
  selector: "app-sticky-action-bar",
  templateUrl: "./sticky-action-bar.component.html",
  styleUrls: ["./sticky-action-bar.component.css"],
  imports: [],
})
export class StickyActionBarComponent {
  @Input() visible: boolean = true;
  @Input() breakpoint: "mobile" | "tablet" = "mobile";
  @Input() align: "between" | "end" = "between";
}
