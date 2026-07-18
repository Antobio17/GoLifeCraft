export interface AuthUser {
  username: string;
  email: string;
  name?: string | null;
  lastname?: string | null;
  roles?: string[];
  role?: string;
}

export interface AuthSession {
  token: string;
  expiresAt: number;
  tokenType: string;
  refreshToken?: string;
  user: AuthUser;
  email: string;
}
