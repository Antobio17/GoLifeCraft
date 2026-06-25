import { Component, Input } from "@angular/core";
import {
  AvatarChipColor,
  AvatarChipSize,
  AvatarChipVariant,
} from "../../domain/models/avatar-chip.model";
import { getInitials } from "../../domain/services/avatar-initials.util";

@Component({
  selector: "app-avatar-chip",
  templateUrl: "./avatar-chip.component.html",
  styleUrls: ["./avatar-chip.component.css"],
  imports: [],
})
export class AvatarChipComponent {
  @Input() name: string = "";
  @Input() size: AvatarChipSize = "md";
  @Input() color?: AvatarChipColor;
  @Input() variant: AvatarChipVariant = "gradient";

  get initials(): string {
    return getInitials(this.name);
  }

  get chipClasses(): string {
    const classes = [
      "avatar-chip",
      `avatar-chip--${this.size}`,
      `avatar-chip--${this.variant}`,
    ];
    if (this.variant === "solid" && this.color) {
      classes.push(`avatar-chip--${this.color}`);
    }
    return classes.join(" ");
  }
}
