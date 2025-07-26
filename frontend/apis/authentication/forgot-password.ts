import { apiPost } from "../../config/api";
import { ApiResponse } from "../../types/generic-types";
import { ForgotPasswordInterface } from "../../types/authentication";
import { useMutation } from "@tanstack/react-query";



export async function forgotPassword(props: ForgotPasswordInterface): Promise<ApiResponse<null>>{
    return apiPost<ApiResponse<null>>("/auth/forgot-password", props );
}


export function useForgotPassword() {
    return useMutation<ApiResponse<null>, Error, ForgotPasswordInterface>({
       mutationFn: forgotPassword,
    });
}
