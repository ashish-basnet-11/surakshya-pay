import { apiPost } from "../../config/api";
import { ApiResponse } from "../../types/generic-types";
import { LoginResponse } from "../../types/authentication";
import { useMutation } from "@tanstack/react-query";
import { UserLogin } from "@/types/user";

export async function loginUser(
  user: UserLogin
): Promise<ApiResponse<LoginResponse>> {

  return apiPost<ApiResponse<LoginResponse>>("/auth/login/zkp", user);
}

export function useUserLogin() {
  return useMutation<ApiResponse<LoginResponse>, Error, UserLogin>({
    mutationFn: loginUser,
  });
}

