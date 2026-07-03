export type FormCheckboxGridValue = string | number;

export interface FormCheckboxGridOption {
  value: FormCheckboxGridValue;
  label: string;
  disabled?: boolean;
}

export interface FormCheckboxGridConfig {
  label?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  columns?: number;
}
