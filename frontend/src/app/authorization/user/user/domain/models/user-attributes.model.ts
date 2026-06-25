export interface UserAttributes {
  username: string;
  email: string;
  name: string;
  lastname: string;
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  canCreateFolder: boolean;
  canDeleteFolder: boolean;
  canUploadFile: boolean;
  canDeleteFile: boolean;
  canSignFile: boolean;
  canRollbackSign: boolean;
  canAccessUsers: boolean;
}
