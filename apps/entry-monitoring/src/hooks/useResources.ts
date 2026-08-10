import { useQuery } from "@tanstack/react-query";
import { getResources } from "../apis";
import { bytesToMegabytes } from "../utils";

const RESOURCE_STALE_TIME = 5 * 60 * 1000;

export const useResources = () => {
  const query = useQuery({
    queryKey: ["monitoring", "resources"],
    queryFn: ({ signal }) => getResources(signal),
    select: data => ({
      dbUsageMb: bytesToMegabytes(data.database.usedBytes),
      bucketUsageMb: bytesToMegabytes(data.bucket.usedBytes),
    }),
    staleTime: RESOURCE_STALE_TIME,
  });

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};
