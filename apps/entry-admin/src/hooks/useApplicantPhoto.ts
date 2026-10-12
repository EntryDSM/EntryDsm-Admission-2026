import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getPhotoFile } from "../apis";

/**
 * 서명 URL 은 곧 만료돼 모달을 열 때마다 새로 받는다(staleTime 0). 재조회 중에는 옛 URL 이 남아 있어 `isPhotoFetching` 을 함께 본다.
 * 사진이 없어도 화면은 placeholder 로 동작해 전역 토스트를 끄고, 404 는 Sentry 보고에서도 뺀다.
 */
export const useApplicantPhoto = (photoFileId?: string | null, enabled = true) => {
  const query = useQuery({
    queryKey: adminQueryKeys.documents.photo(photoFileId ?? ""),
    queryFn: () => getPhotoFile(photoFileId as string),
    enabled: enabled && !!photoFileId,
    staleTime: 0,
    retry: false,
    meta: { suppressGlobalErrorToast: true, sentryIgnoreStatuses: [404] },
  });

  return {
    photoUrl: query.data?.downloadUrl,
    isPhotoFetching: query.isFetching,
    isPhotoLoading: query.isLoading,
    isPhotoError: query.isError,
  };
};
