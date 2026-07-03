export type FilterFieldType =
  | "text"
  | "select"
  | "toggle"
  | "segmented"
  | "chips"
  | "date";

export type FilterValue = string | boolean;

export interface FilterSelectOption {
  value: string;
  label: string;
  color?: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: FilterFieldType;
  placeholder?: string;
  options?: FilterSelectOption[];
  defaultValue?: FilterValue;
  disabled?: boolean;
  trueLabel?: string;
  falseLabel?: string;
}
