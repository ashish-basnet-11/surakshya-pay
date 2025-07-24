import { apiPost } from "../../config/api";
import { ApiResponse } from "../../types/generic-types";
import { LoginResponse } from "../../types/authentication";
import { useMutation } from "@tanstack/react-query";

export async function loginUser(
  user: FormData
): Promise<ApiResponse<LoginResponse>> {

  return apiPost<ApiResponse<LoginResponse>>("/auth/login", user);
}

export function useUserLogin() {
  return useMutation<ApiResponse<LoginResponse>, Error, FormData>({
    mutationFn: loginUser,
  });
}

