import { UserAttributes } from "./user-attributes.model";

export interface User {
  id: string;
  type: string;
  attributes: UserAttributes;
}
