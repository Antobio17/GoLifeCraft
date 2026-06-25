import { Component, Input, inject } from "@angular/core";
import { ControlValueAccessor, NgControl, FormsModule } from "@angular/forms";
import {
  FormSelectConfig,
  FormSelectErrorMessages,
  FormSelectOption,
} from "../../domain/models/form-select.model";
import { ContextualTranslatePipe } from "../../../i18n/infrastructure/pipes/contextual-translate.pipe";

@Component({
  selector: "app-form-select",
  templateUrl: "./form-select.component.html",
  styleUrls: ["./form-select.component.css"],
  imports: [FormsModule, ContextualTranslatePipe],
})
export class FormSelectComponent implements ControlValueAccessor {
  ngControl = inject(NgControl, { optional: true, self: true })!;

  @Input() label: string = "";
  @Input() placeholder?: string;
  @Input() showRequired: boolean = false;
  @Input() disabled: boolean = false;
  @Input() options: FormSelectOption[] = [];
  @Input() errorMessages?: FormSelectErrorMessages;
  @Input() hint?: string;
  @Input() config?: FormSelectConfig;
  @Input() optionLabelPrefix?: string;
  @Input() hideEmptyOption: boolean = false;

  value: any = null;
  isTouched: boolean = false;
  isFocused: boolean = false;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get finalConfig(): FormSelectConfig {
    if (this.config) {
      return this.config;
    }
    return {
      label: this.label,
      placeholder: this.placeholder,
      required: this.showRequired,
      disabled: this.disabled,
      options: this.options,
    };
  }

  get finalOptions(): FormSelectOption[] {
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

    return `formSelect.errors.${errorKey}`;
  }

  writeValue(value: any): void {
    this.value = value ?? "";
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

  onSelectChange(value: any): void {
    // Handle special cases for value conversion
    if (value === "null") {
      value = null;
    } else if (value === "true") {
      value = true;
    } else if (value === "false") {
      value = false;
    } else if (value === "") {
      value = null;
    }

    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.isTouched = true;
    this.isFocused = false;
    this.onTouched();
  }

  onFocus(): void {
    this.isFocused = true;
  }

  getOptionValue(option: FormSelectOption): any {
    if (option.value === null) {
      return "null";
    }
    if (typeof option.value === "boolean") {
      return option.value.toString();
    }
    return option.value;
  }

  isOptionSelected(option: FormSelectOption): boolean {
    return this.value === option.value;
  }
}
