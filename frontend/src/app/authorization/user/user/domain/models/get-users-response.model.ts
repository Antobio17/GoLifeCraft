import { User } from "./user.model";
import { GetUsersMeta } from "./get-users-meta.model";

export interface GetUsersResponse {
  meta: GetUsersMeta;
  data: User[];
}
