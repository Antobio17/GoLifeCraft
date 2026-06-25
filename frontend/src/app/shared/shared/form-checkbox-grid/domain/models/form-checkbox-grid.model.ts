export interface FormCheckboxGridOption {
  value: any;
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
