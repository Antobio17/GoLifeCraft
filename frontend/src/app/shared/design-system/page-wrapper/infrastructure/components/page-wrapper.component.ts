import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-page-wrapper",
  templateUrl: "./page-wrapper.component.html",
  styleUrls: ["./page-wrapper.component.css"],
})
export class PageWrapperComponent {
  @Input() maxWidth = "87.5rem";
  @Input() gap = "var(--ds-space-8)";
}
