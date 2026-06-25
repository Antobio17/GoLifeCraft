export type FormInputType =
  | "text"
  | "email"
  | "password"
  | "tel"
  | "url"
  | "number"
  | "date"
  | "time"
  | "datetime-local";

export interface FormInputConfig {
  label: string;
  placeholder?: string;
  type?: FormInputType;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  autocomplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
}

export interface FormInputErrorMessages {
  required?: string;
  email?: string;
  pattern?: string;
  minlength?: string;
  maxlength?: string;
  min?: string;
  max?: string;
  [key: string]: string | undefined;
}
