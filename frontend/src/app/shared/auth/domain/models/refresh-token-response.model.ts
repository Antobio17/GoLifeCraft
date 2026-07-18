export interface RefreshTokenResponse {
  data: {
    token: string;
    expires_at: number;
    token_type: string;
    refresh_token: string;
  };
}
