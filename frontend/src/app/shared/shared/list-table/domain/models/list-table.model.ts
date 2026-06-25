export type ListCellIcon = "folder" | "file";

export interface ListColumn<T = any> {
  key: string;
  label: string;
  value: (row: T) => any;
  width?: string;
  minWidth?: string;
  format?: "date" | "datetime";
  translate?: boolean;
  badge?: (row: T) => string;
  icon?: (row: T) => ListCellIcon | null;
  link?: (row: T) => boolean;
  cardPrimary?: boolean;
  cardLabel?: string;
  hideInCard?: boolean;
}

export type ListActionIcon =
  | "view"
  | "edit"
  | "delete"
  | "open"
  | "preview"
  | "download";

export interface ListAction<T = any> {
  key: string;
  label: string;
  icon: ListActionIcon;
  danger?: boolean;
  visible?: (row: T) => boolean;
}

export interface ListActionEvent<T = any> {
  key: string;
  row: T;
}

export interface ListCellClickEvent<T = any> {
  column: string;
  row: T;
}
