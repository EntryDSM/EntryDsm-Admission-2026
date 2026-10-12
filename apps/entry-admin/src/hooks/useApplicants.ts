import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getApplicants, type GetApplicantsParams } from "../apis";
import { toApplicantListItem } from "../utils";

/** 페이지를 옮길 때 이전 데이터를 유지해 깜빡임을 줄인다. */
export const useApplicants = (params: GetApplicantsParams) => {
  const query = useQuery({
    queryKey: adminQueryKeys.applicants.list(params),
    queryFn: () => getApplicants(params),
    placeholderData: keepPreviousData,
    select: ({ items, ...pageInfo }) => ({
      applicants: items.map(toApplicantListItem),
      pageInfo,
    }),
  });

  return {
    applicants: query.data?.applicants ?? [],
    pageInfo: query.data?.pageInfo,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};
