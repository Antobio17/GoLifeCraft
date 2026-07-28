import { MenuListItem } from "./menu.model";

export interface GetMenusMeta {
  pageNumber: number;
  pageSize: number;
  total: number;
}

export interface GetMenusResponse {
  meta: GetMenusMeta;
  data: MenuListItem[];
}
