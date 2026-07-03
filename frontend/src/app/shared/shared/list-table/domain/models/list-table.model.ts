export type ListCellIcon = "folder" | "file";

export interface ListColumn<T = unknown> {
  key: string;
  label: string;
  value: (row: T) => string;
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

export interface ListAction<T = unknown> {
  key: string;
  label: string;
  icon: ListActionIcon;
  danger?: boolean;
  visible?: (row: T) => boolean;
}

export interface ListActionEvent<T = unknown> {
  key: string;
  row: T;
}

export interface ListCellClickEvent<T = unknown> {
  column: string;
  row: T;
}
