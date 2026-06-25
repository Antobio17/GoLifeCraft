export interface FormDateConfig {
  label: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  clearable?: boolean;
  min?: string;
  max?: string;
}

export interface FormDateErrorMessages {
  required?: string;
  min?: string;
  max?: string;
  [key: string]: string | undefined;
}
