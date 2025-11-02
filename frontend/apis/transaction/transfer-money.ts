import { apiPost } from "@/config/api";
import { ApiResponse } from "@/types/generic-types";
import { TransferInterface } from "@/types/transaction";
import { useMutation } from "@tanstack/react-query";

export async function transferMoney(
  props: TransferInterface
): Promise<ApiResponse<null>> {
  const url = `/transactions/transfer?to_username=${props.to_username}&amount=${props.amount}&category=${props.category}`;
  console.log(url);
  return apiPost<ApiResponse<null>>(
    url,
    {}
  );
}

export function useTransferMoney() {
  return useMutation<ApiResponse<null>, Error, TransferInterface>({
    mutationFn: transferMoney,
  });
}
