export interface GetMyProfileResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      username: string;
      email: string;
      name: string | null;
      lastname: string | null;
      role: string;
      isActive: boolean;
      canCreateFolder: boolean;
      canDeleteFolder: boolean;
      canUploadFile: boolean;
      canDeleteFile: boolean;
      canSignFile: boolean;
      canRollbackSign: boolean;
      canAccessUsers: boolean;
    };
  };
}
