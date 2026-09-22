import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys, getPhotoFile } from "../apis";

/**
 * 지원자 증명사진 조회 훅. 상세 응답의 `photoFileId` 로 document 에서 서명 URL 을 받는다.
 * - `photoFileId` 가 없거나(사진 미등록) 모달이 닫혀 있으면 요청하지 않는다.
 * - 서명 URL 은 `expiresIn` 초 뒤 죽으므로 캐시를 신선하게 두지 않고(staleTime 0), 모달을 다시 열 때마다 새로 받는다.
 *   재조회 중에는 캐시된 옛 URL 이 남아 있으므로(react-query 는 refetch 중에도 data 를 유지) `isPhotoFetching` 으로 감춘다.
 * - 사진을 못 받아도 상세 화면은 placeholder 로 동작하므로 전역 에러 토스트는 끄고, 없는 파일(404)은 Sentry 보고에서도 뺀다.
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
    /** 서명된 사진 URL. 사진이 없거나 아직 못 받았으면 undefined. 재조회 중이면 만료됐을 수 있는 옛 값이므로 `isPhotoFetching` 과 함께 본다. */
    photoUrl: query.data?.downloadUrl,
    /** 새 서명 URL 을 받는 중(모달을 다시 열어 재조회하는 동안 포함) */
    isPhotoFetching: query.isFetching,
    isPhotoLoading: query.isLoading,
    isPhotoError: query.isError,
  };
};
