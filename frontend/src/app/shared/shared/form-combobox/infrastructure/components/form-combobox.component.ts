import { Component, Input, inject } from "@angular/core";
import { ControlValueAccessor, NgControl, FormsModule } from "@angular/forms";
import {
  FormComboboxConfig,
  FormComboboxErrorMessages,
  FormComboboxOption,
} from "../../domain/models/form-combobox.model";
import { ContextualTranslatePipe } from "../../../i18n/infrastructure/pipes/contextual-translate.pipe";

@Component({
  selector: "app-form-combobox",
  templateUrl: "./form-combobox.component.html",
  styleUrls: ["./form-combobox.component.css"],
  imports: [FormsModule, ContextualTranslatePipe],
})
export class FormComboboxComponent implements ControlValueAccessor {
  ngControl = inject(NgControl, { optional: true, self: true })!;

  @Input() label: string = "";
  @Input() placeholder: string = "";
  @Input() showRequired: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() options: FormComboboxOption[] = [];
  @Input() errorMessages?: FormComboboxErrorMessages;
  @Input() hint?: string;
  @Input() config?: FormComboboxConfig;

  readonly inputId = `form-combobox-${Math.random().toString(36).substring(2, 11)}`;
  value: string = "";
  isTouched: boolean = false;
  isFocused: boolean = false;

  datalistId: string = "";

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.datalistId = "combobox-" + Math.random().toString(36).substring(2, 11);
  }

  get finalConfig(): FormComboboxConfig {
    if (this.config) {
      return this.config;
    }
    return {
      label: this.label,
      placeholder: this.placeholder,
      required: this.showRequired,
      disabled: this.disabled,
      readonly: this.readonly,
      options: this.options,
    };
  }

  get finalOptions(): FormComboboxOption[] {
    return this.config?.options || this.options;
  }

  get isInvalid(): boolean {
    return !!(
      this.ngControl?.invalid &&
      (this.ngControl?.touched || this.isTouched)
    );
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

    return `formCombobox.errors.${errorKey}`;
  }

  writeValue(value: string): void {
    this.value = value || "";
  }

  registerOnChange(fn: (value: string) => void): void {
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
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.isTouched = true;
    this.isFocused = false;
    this.onTouched();
  }

  onFocus(): void {
    this.isFocused = true;
  }
}
