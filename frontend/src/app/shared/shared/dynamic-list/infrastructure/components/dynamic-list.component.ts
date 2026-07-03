import { Component, Input, forwardRef, inject } from "@angular/core";
import {
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { DynamicListConfig } from "../../domain/models/dynamic-list.model";
import { DecimalPipe } from "@angular/common";
import { ContextualTranslatePipe } from "../../../i18n/infrastructure/pipes/contextual-translate.pipe";
import { ButtonComponent } from "@shared/shared/button/infrastructure/components/button.component";

@Component({
  selector: "app-dynamic-list",
  templateUrl: "./dynamic-list.component.html",
  styleUrls: ["./dynamic-list.component.css"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicListComponent),
      multi: true,
    },
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DecimalPipe,
    ContextualTranslatePipe,
    ButtonComponent,
  ],
})
export class DynamicListComponent implements ControlValueAccessor {
  private formBuilder = inject(FormBuilder);

  @Input() config!: DynamicListConfig;

  itemsArray: FormArray;
  onChange: (value: unknown) => void = () => {};
  onTouched: () => void = () => {};
  disabled: boolean = false;

  constructor() {
    this.itemsArray = this.formBuilder.array([]);

    this.itemsArray.valueChanges.subscribe((value) => {
      this.onChange(value);
    });
  }

  get totalItems(): number {
    return this.itemsArray.length;
  }

  get totalValue(): number | null {
    if (this.config.fieldType !== "number") {
      return null;
    }

    let hasAtLeastOneValidValue = false;
    const total = this.itemsArray.controls.reduce((sum, control) => {
      const value = control.get(this.config.fieldName)?.value;
      if (value === null || value === undefined || value === "") {
        return sum;
      }
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return sum;
      }
      hasAtLeastOneValidValue = true;
      return sum + numValue;
    }, 0);

    return hasAtLeastOneValidValue ? total : null;
  }

  get showTotals(): boolean {
    return (
      this.itemsArray.length > 0 &&
      (this.config.totalItemsLabel !== undefined ||
        (this.config.totalValueLabel !== undefined && this.totalValue !== null))
    );
  }

  writeValue(value: unknown): void {
    this.itemsArray.clear();
    if (!Array.isArray(value)) {
      return;
    }
    value.forEach((item) => {
      this.itemsArray.push(this.createItemGroup(item));
    });
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.itemsArray.disable();
    } else {
      this.itemsArray.enable();
    }
  }

  private createItemGroup(value?: Record<string, unknown>): FormGroup {
    const validators = [];

    if (this.config.required) {
      validators.push(Validators.required);
    }

    if (this.config.fieldType === "number" && this.config.min !== undefined) {
      validators.push(Validators.min(this.config.min));
    }

    const initialValue = value ? value[this.config.fieldName] : null;

    return this.formBuilder.group({
      [this.config.fieldName]: [initialValue, validators],
    });
  }

  addItem(): void {
    this.itemsArray.push(this.createItemGroup());
    this.onChange(this.itemsArray.value);
  }

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
    this.onChange(this.itemsArray.value);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
