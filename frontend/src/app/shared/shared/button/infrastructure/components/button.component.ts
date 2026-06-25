import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
  ButtonVariant,
  ButtonSize,
  ButtonType,
} from "../../domain/models/button.model";

@Component({
  selector: "app-button",
  templateUrl: "./button.component.html",
  styleUrls: ["./button.component.css"],
  imports: [],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = "primary";
  @Input() size: ButtonSize = "md";
  @Input() type: ButtonType = "button";
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;

  @Output() clicked = new EventEmitter<void>();

  get buttonClasses(): string {
    const classes = ["btn", `btn-${this.variant}`, `btn-${this.size}`];
    if (this.fullWidth) classes.push("btn-full-width");
    if (this.loading) classes.push("btn-loading");
    return classes.join(" ");
  }

  get isDisabled(): boolean {
    return this.disabled || this.loading;
  }

  handleClick(): void {
    if (!this.isDisabled) {
      this.clicked.emit();
    }
  }
}
