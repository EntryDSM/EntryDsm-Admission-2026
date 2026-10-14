import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getApplicationEditableFields } from "../apis";

/** 원서 정정 가능 여부. 그사이 전형 결과가 나왔을 수 있어 마운트할 때마다 다시 받는다. */
export const useApplicationEditableFields = (applicantId: number) => {
  const query = useQuery({
    queryKey: adminQueryKeys.applicants.editableFields(applicantId),
    queryFn: () => getApplicationEditableFields(applicantId),
    refetchOnMount: "always",
  });

  return {
    editableFields: query.data,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};
