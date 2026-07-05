import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-brand-logo",
  standalone: true,
  templateUrl: "./brand-logo.component.html",
  styleUrls: ["./brand-logo.component.css"],
  imports: [],
})
export class BrandLogoComponent {
  @Input() markSize = 58;
  @Input() wordmarkSize = 23;
  @Input() stacked = false;
  @Input() showWordmark = true;
  @Input() showMark = true;
  @Input() tagline: string | null = null;
}
