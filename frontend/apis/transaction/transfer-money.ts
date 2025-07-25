import { apiPost } from "@/config/api";
import { ApiResponse } from "@/types/generic-types";
import { TransferInterface } from "@/types/transaction";
import { useMutation } from "@tanstack/react-query";

 export async function transferMoney(props: TransferInterface): Promise<ApiResponse<null>> {
    return apiPost<ApiResponse<null>>("/transactions/transfer", props);
 }

 export function useTransferMoney() {
    return useMutation<ApiResponse<null>, Error, TransferInterface>({
        mutationFn: transferMoney,
    })
 }