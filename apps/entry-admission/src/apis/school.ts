import { useQuery } from "@tanstack/react-query";
import { Http } from "./http";

// 학교명으로 검색하되, 검색창 입력만으로 요청하지 않고 호출 화면의 refetch로 실행합니다.
export const useGetSchoolSearch = (schoolName: string) => {
  return useQuery({
    queryKey: ["school", schoolName],
    queryFn: () => Http.get<unknown>("/schools", { auth: false, params: { school_name: schoolName } }),
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });
};
