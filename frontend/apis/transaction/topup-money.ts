import { apiPost } from "@/config/api";
import { ApiResponse } from "@/types/generic-types";
import { TopupInterface } from "@/types/transaction";
import { useMutation } from "@tanstack/react-query";

export async function topupMoney(props: TopupInterface): Promise<ApiResponse<null>> {
  return apiPost<ApiResponse<null>>(`/transactions/topup?amount=${props.amount}`, {});
}

export function useTopupMoney() {
  return useMutation<ApiResponse<null>, Error, TopupInterface>({
    mutationFn: topupMoney,
  });
}
