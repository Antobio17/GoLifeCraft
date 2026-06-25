export interface DynamicListConfig {
  label: string;
  placeholder: string;
  addButtonLabel: string;
  totalItemsLabel?: string;
  totalValueLabel?: string;
  fieldName: string;
  fieldType: "text" | "number";
  suffix?: string;
  min?: number;
  step?: number;
  required?: boolean;
}

export interface DynamicListItem {
  [key: string]: any;
}
