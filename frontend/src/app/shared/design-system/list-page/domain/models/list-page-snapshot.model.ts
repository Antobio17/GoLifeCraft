export interface ListPageSnapshot<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  scrollTop: number;
  filters: Record<string, string>;
}
