export interface ImpersonateUserResponse {
  data: {
    token: string;
    expires_at: number;
    token_type: string;
    user: {
      id: string;
      email: string;
      name: string | null;
      lastname: string | null;
      tenantId: string;
    };
  };
}
