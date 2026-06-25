export interface FormTextareaConfig {
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  rows?: number;
  maxLength?: number;
  minLength?: number;
}

export interface FormTextareaErrorMessages {
  required?: string;
  minlength?: string;
  maxlength?: string;
  [key: string]: string | undefined;
}
