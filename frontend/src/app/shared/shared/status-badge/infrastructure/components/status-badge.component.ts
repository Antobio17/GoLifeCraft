import { Component, Input } from "@angular/core";
import { StatusBadgeVariant } from "../../domain/models/status-badge-variant.model";
import { StatusBadgeSize } from "../../domain/models/status-badge-size.model";

@Component({
  selector: "app-status-badge",
  templateUrl: "./status-badge.component.html",
  styleUrls: ["./status-badge.component.css"],
  imports: [],
})
export class StatusBadgeComponent {
  @Input() variant: StatusBadgeVariant = "draft";
  @Input() label!: string;
  @Input() size: StatusBadgeSize = "md";
  @Input() animated: boolean = true;

  get badgeClasses(): string {
    const classes = ["badge", `badge--${this.variant}`];
    if (this.size === "sm") {
      classes.push("badge--sm");
    }
    return classes.join(" ");
  }

  get dotClasses(): string {
    const classes = ["dot"];
    if (this.animated) {
      classes.push("dot--animated");
    }
    return classes.join(" ");
  }
}
