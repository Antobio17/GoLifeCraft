import { Component, Input, inject } from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";
import {
  FormTextareaConfig,
  FormTextareaErrorMessages,
} from "../../domain/models/form-textarea.model";
import { ContextualTranslatePipe } from "../../../i18n/infrastructure/pipes/contextual-translate.pipe";

@Component({
  selector: "app-form-textarea",
  templateUrl: "./form-textarea.component.html",
  styleUrls: ["./form-textarea.component.css"],
  imports: [ContextualTranslatePipe],
})
export class FormTextareaComponent implements ControlValueAccessor {
  ngControl = inject(NgControl, { optional: true, self: true })!;

  @Input() label: string = "";
  @Input() placeholder: string = "";
  @Input() showRequired: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() rows: number = 3;
  @Input() maxLength?: number;
  @Input() minLength?: number;
  @Input() errorMessages?: FormTextareaErrorMessages;
  @Input() hint?: string;
  @Input() config?: FormTextareaConfig;

  value: any = "";
  isTouched: boolean = false;
  isFocused: boolean = false;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get finalConfig(): FormTextareaConfig {
    if (this.config) {
      return this.config;
    }
    return {
      label: this.label,
      placeholder: this.placeholder,
      required: this.showRequired,
      disabled: this.disabled,
      readonly: this.readonly,
      rows: this.rows,
      maxLength: this.maxLength,
      minLength: this.minLength,
    };
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

    return `formTextarea.errors.${errorKey}`;
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

  onTextareaChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
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
