import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Http } from "./http";
import type { IPdfPreviewRequest } from "./types";

const PDF_PREVIEW_ENDPOINT = "/pdf/preview";

// 서버에 원서 데이터를 보내 PDF Blob을 생성하는 미리보기 훅입니다.
export const usePdfPreviewPost = <T extends IPdfPreviewRequest>() =>
  useMutation({
    // Blob은 JSON 파서가 아닌 Http.postBlob으로 받아 브라우저 미리보기에 사용합니다.
    mutationFn: (data: T) => Http.postBlob(PDF_PREVIEW_ENDPOINT, data),
    onSuccess: () => {
      toast.success("pdf가 정상적으로 처리되었습니다.");
    },
    onError: () => {
      toast.error("pdf 생성에 실패하였습니다.");
    },
  });
