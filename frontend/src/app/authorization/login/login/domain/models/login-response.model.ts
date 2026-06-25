import { User } from "./login-user.model";

export interface LoginResponse {
  data: {
    token: string;
    expires_at: number;
    token_type: string;
    user: User;
  };
}
