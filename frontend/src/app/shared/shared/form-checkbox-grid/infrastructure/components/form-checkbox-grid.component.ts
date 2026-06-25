import { Component, Input, inject } from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";
import {
  FormCheckboxGridOption,
  FormCheckboxGridConfig,
} from "../../domain/models/form-checkbox-grid.model";
import { ContextualTranslatePipe } from "../../../i18n/infrastructure/pipes/contextual-translate.pipe";

@Component({
  selector: "app-form-checkbox-grid",
  templateUrl: "./form-checkbox-grid.component.html",
  styleUrls: ["./form-checkbox-grid.component.css"],
  imports: [ContextualTranslatePipe],
})
export class FormCheckboxGridComponent implements ControlValueAccessor {
  ngControl = inject(NgControl, { optional: true, self: true })!;

  @Input() label: string = "";
  @Input() hint: string = "";
  @Input() showRequired: boolean = false;
  @Input() disabled: boolean = false;
  @Input() options: FormCheckboxGridOption[] = [];
  @Input() optionLabelPrefix: string = "";
  @Input() config?: FormCheckboxGridConfig;

  value: any[] = [];

  private onChange: (value: any[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get finalLabel(): string {
    return this.config?.label || this.label;
  }

  get finalHint(): string {
    return this.config?.hint || this.hint;
  }

  get isRequired(): boolean {
    return this.config?.required ?? this.showRequired;
  }

  get isDisabled(): boolean {
    return this.config?.disabled ?? this.disabled;
  }

  get isInvalid(): boolean {
    return !!(this.ngControl?.invalid && this.ngControl?.touched);
  }

  get firstError(): string | null {
    if (!this.ngControl?.errors) {
      return null;
    }
    const errorKey = Object.keys(this.ngControl.errors)[0];
    return `formCheckboxGrid.errors.${errorKey}`;
  }

  isSelected(optionValue: any): boolean {
    if (!this.value || !Array.isArray(this.value)) {
      return false;
    }
    return this.value.includes(optionValue);
  }

  toggle(optionValue: any): void {
    if (this.isDisabled) {
      return;
    }

    const currentValues = Array.isArray(this.value) ? [...this.value] : [];
    const index = currentValues.indexOf(optionValue);

    if (index === -1) {
      currentValues.push(optionValue);
    } else {
      currentValues.splice(index, 1);
    }

    this.value = currentValues;
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: any): void {
    this.value = Array.isArray(value) ? value : [];
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
}
