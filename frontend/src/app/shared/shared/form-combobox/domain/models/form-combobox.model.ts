export interface FormComboboxOption {
  label: string;
}

export interface FormComboboxConfig {
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  options?: FormComboboxOption[];
}

export interface FormComboboxErrorMessages {
  required?: string;
  minlength?: string;
  maxlength?: string;
  pattern?: string;
  [key: string]: string | undefined;
}
