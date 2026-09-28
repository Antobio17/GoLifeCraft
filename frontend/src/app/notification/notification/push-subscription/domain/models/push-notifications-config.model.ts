export interface PushNotificationsConfig {
  enabled: boolean;
  vapidPublicKey: string | null;
  subscriptions: number;
}
