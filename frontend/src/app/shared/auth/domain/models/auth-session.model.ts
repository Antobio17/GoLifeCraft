export interface AuthUser {
  username: string;
  email: string;
  roles?: string[];
  role?: string;
  canCreateFolder?: boolean;
  canDeleteFolder?: boolean;
  canUploadFile?: boolean;
  canDeleteFile?: boolean;
  canSignFile?: boolean;
  canRollbackSign?: boolean;
  canAccessUsers?: boolean;
}

export interface AuthSession {
  token: string;
  expiresAt: number;
  tokenType: string;
  user: AuthUser;
  username: string;
}
