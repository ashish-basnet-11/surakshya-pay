import { apiPost } from "@/config/api";
import { ApiResponse } from "@/types/generic-types";
import { WithDrawInterface } from "@/types/transaction";
import { useMutation } from "@tanstack/react-query";

export async function withdrawMoney(props: WithDrawInterface): Promise<ApiResponse<null>> {
    return apiPost<ApiResponse<null>>(
        `/transactions/withdraw?amount=${props.amount}`, {});
}

export function useWithdrawMoney() {
    return useMutation<ApiResponse<null>, Error, WithDrawInterface>({
        mutationFn: withdrawMoney,
    })
}
