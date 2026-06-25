import { Component, Input } from "@angular/core";
import {
  IconChipTone,
  IconChipSize,
} from "../../domain/models/icon-chip.model";

@Component({
  selector: "app-icon-chip",
  templateUrl: "./icon-chip.component.html",
  styleUrls: ["./icon-chip.component.css"],
  imports: [],
})
export class IconChipComponent {
  @Input() tone: IconChipTone = "sky";
  @Input() size: IconChipSize = "md";
  @Input() ariaHidden: boolean = true;
  @Input() ariaLabel?: string;

  get chipClasses(): string {
    return [
      "icon-chip",
      `icon-chip--${this.tone}`,
      `icon-chip--size-${this.size}`,
    ].join(" ");
  }
}
