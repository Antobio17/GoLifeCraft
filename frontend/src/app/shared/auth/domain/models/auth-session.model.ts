export interface AuthUser {
  username: string;
  email: string;
  roles?: string[];
  role?: string;
}

export interface AuthSession {
  token: string;
  expiresAt: number;
  tokenType: string;
  user: AuthUser;
  username: string;
}
