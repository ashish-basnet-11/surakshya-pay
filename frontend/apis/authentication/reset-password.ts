import { apiPost } from "@/config/api";
import { ResetPasswordInterface } from "@/types/authentication";
import { ApiResponse } from "@/types/generic-types";
import { useMutation } from "@tanstack/react-query";

export async function resetPassword (props: ResetPasswordInterface): Promise<ApiResponse<null>>{
    return apiPost<ApiResponse<null>>("auth/reset-password", props)
}

export function useResetPassword() {
    return useMutation<ApiResponse<null>, Error, ResetPasswordInterface>({
        mutationFn: resetPassword,
    })
}