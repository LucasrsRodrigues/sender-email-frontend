import { useQuery } from "@tanstack/react-query";
import { getQueueStatus, type IGetQueueStatusResponse } from "../../api/metrics";


export const useQueueStatus = () => {
  return useQuery<IGetQueueStatusResponse>({
    queryKey: ["queue-status"],
    queryFn: () => getQueueStatus(),
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });
};