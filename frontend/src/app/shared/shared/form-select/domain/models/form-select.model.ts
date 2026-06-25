export interface FormSelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export interface FormSelectConfig {
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: FormSelectOption[];
}

export interface FormSelectErrorMessages {
  required?: string;
  [key: string]: string | undefined;
}
