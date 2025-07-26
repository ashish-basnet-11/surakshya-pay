export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: "transaction" | string;
  user_id: number;
  is_read: boolean;
  created_at: string;
}
