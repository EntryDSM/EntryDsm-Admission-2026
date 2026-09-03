import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Http } from "./http";
import type { IValidateRequest } from "./types";

// 성적 저장 전 별도 유효성 검사를 요청하는 레거시 훅입니다.
export const useValidatePost = <T extends IValidateRequest>() => {
  return useMutation({
    mutationFn: (data: T) => Http.post<unknown>("/api/v1/validate", data),
    onSuccess: () => {
      toast.success("성적 데이터 유효성 검사가 완료되었습니다.");
    },
    onError: error => {
      toast.error(error.message);
    },
  });
};
