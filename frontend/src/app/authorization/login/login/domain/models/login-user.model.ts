export interface User {
  username: string;
  email: string;
  roles: string[];
  canCreateFolder?: boolean;
  canDeleteFolder?: boolean;
  canUploadFile?: boolean;
  canDeleteFile?: boolean;
  canSignFile?: boolean;
  canRollbackSign?: boolean;
  canAccessUsers?: boolean;
}
