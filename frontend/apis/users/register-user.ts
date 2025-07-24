import { apiPost } from "@/config/api";
import { LoginResponse } from "@/types/authentication";
import { ApiResponse } from "@/types/generic-types";
import { UserCreate } from "@/types/user";
import { useMutation } from "@tanstack/react-query";

async function registerUser(
  user: UserCreate
): Promise<ApiResponse<LoginResponse>> {
  const response = await apiPost<ApiResponse<LoginResponse>>(
    "/users",
    user
  );
  return response;
}

export function useRegisterUser() {
  return useMutation<ApiResponse<LoginResponse>, Error, UserCreate>({
    mutationFn: registerUser,
  });
}
