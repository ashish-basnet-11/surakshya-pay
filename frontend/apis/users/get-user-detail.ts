import { apiGet } from "@/config/api";
import { ApiResponse } from "@/types/generic-types";
import { User } from "@/types/user";
import { useQuery } from "@tanstack/react-query";

async function getCurrentUserDetail(): Promise<ApiResponse<User>> {
  const response = await apiGet<ApiResponse<User>>("/users/me");
  return response;
}

export function useCurrentUserDetail(options : any) {
  return useQuery({
    queryKey: ["user-detail"],
    queryFn: getCurrentUserDetail,
    ...options,
  });
}
