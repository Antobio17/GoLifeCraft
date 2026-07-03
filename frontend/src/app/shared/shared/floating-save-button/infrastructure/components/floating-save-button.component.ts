import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import {
  FloatingSaveButtonConfig,
  DEFAULT_FLOATING_SAVE_BUTTON_CONFIG,
} from "../../domain/models/floating-save-button.model";
import { ContextualTranslatePipe } from "../../../i18n/infrastructure/pipes/contextual-translate.pipe";
import { ButtonComponent } from "@shared/shared/button/infrastructure/components/button.component";

@Component({
  selector: "app-floating-save-button",
  templateUrl: "./floating-save-button.component.html",
  styleUrls: ["./floating-save-button.component.css"],
  imports: [ContextualTranslatePipe, ButtonComponent],
})
export class FloatingSaveButtonComponent implements OnInit {
  @Input() label?: string;
  @Input() loadingLabel?: string;
  @Input() disabled?: boolean;
  @Input() loading?: boolean;
  @Input() type?: "button" | "submit";
  @Input() variant?: "primary" | "secondary" | "success" | "danger" | "warning";
  @Input() size?: "small" | "medium" | "large";
  @Input() showIcon?: boolean = true;
  @Input() customIcon?: string;
  @Input() fullWidth?: boolean = false;

  @Output() clicked = new EventEmitter<void>();

  config: Required<FloatingSaveButtonConfig>;

  constructor() {
    this.config = { ...DEFAULT_FLOATING_SAVE_BUTTON_CONFIG };
  }

  ngOnInit(): void {
    this.updateConfig();
  }

  private updateConfig(): void {
    this.config = {
      label: this.label ?? DEFAULT_FLOATING_SAVE_BUTTON_CONFIG.label,
      loadingLabel:
        this.loadingLabel ?? DEFAULT_FLOATING_SAVE_BUTTON_CONFIG.loadingLabel,
      disabled: this.disabled ?? DEFAULT_FLOATING_SAVE_BUTTON_CONFIG.disabled,
      loading: this.loading ?? DEFAULT_FLOATING_SAVE_BUTTON_CONFIG.loading,
      type: this.type ?? DEFAULT_FLOATING_SAVE_BUTTON_CONFIG.type,
      variant: this.variant ?? DEFAULT_FLOATING_SAVE_BUTTON_CONFIG.variant,
      size: this.size ?? DEFAULT_FLOATING_SAVE_BUTTON_CONFIG.size,
      icon: {
        show: this.showIcon ?? true,
        customIcon: this.customIcon,
      },
      fullWidth:
        this.fullWidth ?? DEFAULT_FLOATING_SAVE_BUTTON_CONFIG.fullWidth,
    };
  }

  handleClick(): void {
    if (!this.isDisabled()) {
      this.clicked.emit();
    }
  }

  isDisabled(): boolean {
    return this.disabled || this.loading || false;
  }

  getButtonClasses(): string {
    const classes = ["btn", `btn-${this.variant || "primary"}`];

    if (this.size) {
      classes.push(`btn-${this.size}`);
    }

    if (this.fullWidth) {
      classes.push("btn-full-width");
    }

    if (this.loading) {
      classes.push("btn-loading");
    }

    return classes.join(" ");
  }
}
