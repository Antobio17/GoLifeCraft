export interface UpdateUserRequest {
  username: string;
  email: string;
  name: string;
  lastname: string;
  isActive: boolean;
  role: string;
  canCreateFolder: boolean;
  canDeleteFolder: boolean;
  canUploadFile: boolean;
  canDeleteFile: boolean;
  canSignFile: boolean;
  canRollbackSign: boolean;
  canAccessUsers: boolean;
}
