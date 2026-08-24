export interface UserDetail {
  id: string;
  username: string;
  email: string;
  name: string | null;
  lastname: string | null;
  role: string;
  tenantId: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
