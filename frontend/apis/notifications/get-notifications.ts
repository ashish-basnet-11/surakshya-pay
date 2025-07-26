import { apiGet } from "@/config/api";
import { ApiResponse } from "@/types/generic-types";
import { useQuery } from "@tanstack/react-query";
import { Notification as NotificationInterface } from "@/types/notifications";

async function getNotificationList(): Promise<ApiResponse<NotificationInterface[]>> {
  const response = await apiGet<ApiResponse<NotificationInterface[]>>("/notifications");
  return response;
}

export function useNotificationsList(options? : any) {
  return useQuery<ApiResponse<NotificationInterface[]>>({
    queryKey: ["notifications-list"],
    queryFn: getNotificationList,
    ...options,
  });
}
