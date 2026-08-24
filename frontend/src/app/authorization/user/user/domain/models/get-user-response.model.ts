import { UserDetail } from "./user-detail.model";

export interface GetUserResponse {
  data: {
    id: string;
    type: string;
    attributes: Omit<UserDetail, "id">;
  };
}
