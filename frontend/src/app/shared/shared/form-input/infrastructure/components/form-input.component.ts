import {
  Component,
  Input,
  inject,
  Renderer2,
  OnDestroy,
  DOCUMENT,
} from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";
import {
  FormInputConfig,
  FormInputErrorMessages,
  FormInputType,
} from "../../domain/models/form-input.model";
import { ContextualTranslatePipe } from "../../../i18n/infrastructure/pipes/contextual-translate.pipe";

@Component({
  selector: "app-form-input",
  templateUrl: "./form-input.component.html",
  styleUrls: ["./form-input.component.css"],
  imports: [ContextualTranslatePipe],
})
export class FormInputComponent implements ControlValueAccessor, OnDestroy {
  ngControl = inject(NgControl, { optional: true, self: true })!;
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  @Input() label: string = "";
  @Input() placeholder: string = "";
  @Input() type: FormInputType = "text";
  @Input() showRequired: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() autocomplete: string = "off";
  @Input() maxLength?: number;
  @Input() minLength?: number;
  @Input() pattern?: string;
  @Input() min?: number | string;
  @Input() max?: number | string;
  @Input() step?: number | string;
  @Input() errorMessages?: FormInputErrorMessages;
  @Input() hint?: string;
  @Input() tooltip?: string;
  @Input() config?: FormInputConfig;

  value: any = "";
  isFocused: boolean = false;
  showPassword: boolean = false;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  private tooltipEl: HTMLElement | null = null;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get finalConfig(): FormInputConfig {
    if (this.config) {
      return this.config;
    }
    return {
      label: this.label,
      placeholder: this.placeholder,
      type: this.type,
      required: this.showRequired,
      disabled: this.disabled,
      readonly: this.readonly,
      autocomplete: this.autocomplete,
      maxLength: this.maxLength,
      minLength: this.minLength,
      pattern: this.pattern,
      min: this.min,
      max: this.max,
      step: this.step,
    };
  }

  get isPassword(): boolean {
    return (this.finalConfig.type || "text") === "password";
  }

  get effectiveType(): FormInputType {
    const baseType = this.finalConfig.type || "text";
    if (baseType === "password" && this.showPassword) {
      return "text";
    }
    return baseType;
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  get isInvalid(): boolean {
    return !!(this.ngControl?.invalid && this.ngControl?.touched);
  }

  get firstErrorParams(): Record<string, unknown> | undefined {
    if (!this.ngControl?.errors) {
      return undefined;
    }

    const errorKey = Object.keys(this.ngControl.errors)[0];
    const errorValue = this.ngControl.errors[errorKey];

    if (errorValue && typeof errorValue === "object") {
      return errorValue as Record<string, unknown>;
    }

    return undefined;
  }

  get firstError(): string | null {
    if (!this.ngControl?.errors) {
      return null;
    }

    const errors = this.ngControl.errors;
    const errorKey = Object.keys(errors)[0];

    if (this.errorMessages && this.errorMessages[errorKey]) {
      return this.errorMessages[errorKey]!;
    }

    return `formInput.errors.${errorKey}`;
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = this.type === "number" ? target.valueAsNumber : target.value;
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  onFocus(): void {
    this.isFocused = true;
  }

  showTooltip(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.positionAndShowTooltip(rect);
  }

  showTooltipTouch(event: TouchEvent): void {
    event.preventDefault();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.positionAndShowTooltip(rect);
  }

  private positionAndShowTooltip(rect: DOMRect): void {
    if (!this.tooltip) {
      return;
    }

    if (!this.tooltipEl) {
      this.tooltipEl = this.renderer.createElement("span");
      this.applyTooltipStyles();
      this.renderer.appendChild(this.document.body, this.tooltipEl);
    }

    this.renderer.setProperty(this.tooltipEl, "textContent", this.tooltip);

    const margin = 8;
    const tooltipHalfWidth = 130;
    const rawX = rect.left + rect.width / 2;
    const x = Math.max(
      tooltipHalfWidth + margin,
      Math.min(rawX, window.innerWidth - tooltipHalfWidth - margin),
    );

    const showBelow = rect.top < 60;
    if (showBelow) {
      this.renderer.setStyle(this.tooltipEl, "transform", "translate(-50%, 0)");
      this.renderer.setStyle(
        this.tooltipEl,
        "top",
        `${rect.bottom + margin}px`,
      );
    } else {
      this.renderer.setStyle(
        this.tooltipEl,
        "transform",
        "translate(-50%, -100%)",
      );
      this.renderer.setStyle(this.tooltipEl, "top", `${rect.top - margin}px`);
    }

    this.renderer.setStyle(this.tooltipEl, "left", `${x}px`);
    this.renderer.setStyle(this.tooltipEl, "opacity", "1");
    this.renderer.setStyle(this.tooltipEl, "visibility", "visible");
  }

  hideTooltip(): void {
    if (!this.tooltipEl) {
      return;
    }
    this.renderer.setStyle(this.tooltipEl, "opacity", "0");
    this.renderer.setStyle(this.tooltipEl, "visibility", "hidden");
  }

  ngOnDestroy(): void {
    if (this.tooltipEl) {
      this.renderer.removeChild(this.document.body, this.tooltipEl);
      this.tooltipEl = null;
    }
  }

  private applyTooltipStyles(): void {
    const styles: Record<string, string> = {
      position: "fixed",
      transform: "translate(-50%, -100%)",
      background: "#1f2937",
      color: "#f9fafb",
      fontSize: "12px",
      fontWeight: "400",
      lineHeight: "1.5",
      padding: "8px 12px",
      borderRadius: "8px",
      maxWidth: "260px",
      textAlign: "center",
      pointerEvents: "none",
      zIndex: "99999",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      opacity: "0",
      visibility: "hidden",
      transition: "opacity 0.2s ease, visibility 0.2s ease",
      fontFamily: "inherit",
      whiteSpace: "normal",
      wordBreak: "break-word",
    };

    Object.entries(styles).forEach(([prop, value]) => {
      this.renderer.setStyle(this.tooltipEl, prop, value);
    });
  }
}
