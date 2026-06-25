import { Component, Input, inject } from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";
import {
  FormDateConfig,
  FormDateErrorMessages,
} from "../../domain/models/form-date.model";
import { ContextualTranslatePipe } from "../../../i18n/infrastructure/pipes/contextual-translate.pipe";

@Component({
  selector: "app-form-date",
  templateUrl: "./form-date.component.html",
  styleUrls: ["./form-date.component.css"],
  imports: [ContextualTranslatePipe],
})
export class FormDateComponent implements ControlValueAccessor {
  ngControl = inject(NgControl, { optional: true, self: true })!;

  @Input() label: string = "";
  @Input() showRequired: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() clearable: boolean = true;
  @Input() min?: string;
  @Input() max?: string;
  @Input() errorMessages?: FormDateErrorMessages;
  @Input() hint?: string;
  @Input() config?: FormDateConfig;

  value: string | null = "";
  isFocused: boolean = false;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get finalConfig(): FormDateConfig {
    if (this.config) {
      return this.config;
    }
    return {
      label: this.label,
      required: this.showRequired,
      disabled: this.disabled,
      readonly: this.readonly,
      clearable: this.clearable,
      min: this.min,
      max: this.max,
    };
  }

  get isClearable(): boolean {
    return (
      (this.finalConfig.clearable ?? true) &&
      !!this.value &&
      !this.disabled &&
      !(this.finalConfig.readonly ?? false)
    );
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

    const errorKey = Object.keys(this.ngControl.errors)[0];

    if (this.errorMessages && this.errorMessages[errorKey]) {
      return this.errorMessages[errorKey]!;
    }

    return `formDate.errors.${errorKey}`;
  }

  writeValue(value: string | null): void {
    this.value = value ?? "";
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const next = target.value || null;
    this.value = next;
    this.onChange(next);
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  onFocus(): void {
    this.isFocused = true;
  }

  clear(): void {
    this.value = null;
    this.onChange(null);
    this.onTouched();
  }
}
