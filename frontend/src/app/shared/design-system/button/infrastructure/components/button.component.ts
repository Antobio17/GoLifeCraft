import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
  ButtonVariant,
  ButtonSize,
  ButtonType,
} from "../../domain/models/button.model";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-button",
  templateUrl: "./button.component.html",
  styleUrls: ["./button.component.css"],
  imports: [IconComponent],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = "primary";
  @Input() size: ButtonSize = "md";
  @Input() type: ButtonType = "button";
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() icon?: DsIconName;
  @Input() trailingIcon?: DsIconName;
  @Input() iconSize?: number;

  @Output() clicked = new EventEmitter<void>();

  private static readonly ICON_SIZE_BY_SIZE: Record<ButtonSize, number> = {
    lg: 20,
    md: 18,
    sm: 16,
    icon: 16,
    "icon-sm": 16,
    "icon-lg": 20,
  };

  get resolvedIconSize(): number {
    return this.iconSize ?? ButtonComponent.ICON_SIZE_BY_SIZE[this.size];
  }

  get buttonClasses(): string {
    const classes = [
      "ds-btn",
      `ds-btn--${this.variant}`,
      `ds-btn--${this.size}`,
    ];
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
