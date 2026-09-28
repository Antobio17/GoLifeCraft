export interface GetUnreadNotificationsCountResponse {
  data: {
    id: string;
    type: string;
    attributes: { count: number };
  };
}
