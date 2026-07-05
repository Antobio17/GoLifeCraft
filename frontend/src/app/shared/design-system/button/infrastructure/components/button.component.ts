import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
  ButtonVariant,
  ButtonSize,
  ButtonType,
} from "../../domain/models/button.model";

@Component({
  selector: "ds-button",
  templateUrl: "./button.component.html",
  styleUrls: ["./button.component.css"],
  imports: [],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = "primary";
  @Input() size: ButtonSize = "md";
  @Input() type: ButtonType = "button";
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;

  @Output() clicked = new EventEmitter<void>();

  get buttonClasses(): string {
    const classes = ["ds-btn", `ds-btn--${this.variant}`, `ds-btn--${this.size}`];
    if (this.fullWidth) classes.push("ds-btn--full");
    if (this.loading) classes.push("ds-btn--loading");
    return classes.join(" ");
  }

  get isDisabled(): boolean {
    return this.disabled || this.loading;
  }

  handleClick(): void {
    if (this.isDisabled) return;
    this.clicked.emit();
  }
}
