import { Session } from "./session.model";

export interface GetSessionsMeta {
  pageNumber: number;
  pageSize: number;
  total: number;
}

export interface GetSessionsResponse {
  meta: GetSessionsMeta;
  data: Session[];
}
