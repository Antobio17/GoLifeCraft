export type FilterFieldType =
  | "text"
  | "select"
  | "toggle"
  | "segmented"
  | "chips"
  | "date";

export interface FilterSelectOption {
  value: any;
  label: string;
  color?: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: FilterFieldType;
  placeholder?: string;
  options?: FilterSelectOption[];
  defaultValue?: any;
  disabled?: boolean;
  trueLabel?: string;
  falseLabel?: string;
}
