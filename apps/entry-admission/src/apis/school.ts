//TODO: 검색 api 다시 연동 시 다시 사용 할 것
import { useQuery } from "@tanstack/react-query";
import { Http } from "./http";

export interface SchoolSearchItem {
  // 선택된 중학교 정보를 Context와 저장 API에 전달하기 위한 서버 응답 필드입니다.
  code: string;
  name: string;
}

export interface GetMiddleSchoolInformationResponse {
  schools: SchoolSearchItem[];
  hasNext: boolean;
}

// 학교명으로 검색하되, 검색창 입력만으로 요청하지 않고 호출 화면의 refetch로 실행합니다.
export const useGetSchoolSearch = (schoolName: string) => {
  const page = 10;

  return useQuery({
    // 검색어별로 결과를 5분간 분리 캐시해 같은 검색의 중복 요청을 줄입니다.
    queryKey: ["school", schoolName],
    queryFn: () =>
      Http.get<GetMiddleSchoolInformationResponse>("/api/application/v11/middle-school", { params: { page } }),
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });
};
