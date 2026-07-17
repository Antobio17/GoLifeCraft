export interface UserListItemAttributes {
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

export interface UserListItem {
  id: string;
  type: string;
  attributes: UserListItemAttributes;
}

export interface GetUsersResponse {
  meta: {
    pageNumber: number;
    pageSize: number;
    total: number;
  };
  data: UserListItem[];
}
