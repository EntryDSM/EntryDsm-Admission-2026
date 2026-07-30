import { useCallback, useEffect, useRef, useState } from "react";
import { createPassPopup } from "../apis";
import type { PassInfo } from "../apis";

const PASS_RESULT_MESSAGE = "entrydsm:pass-result";

interface PassResultMessage {
  type: typeof PASS_RESULT_MESSAGE;
  success: boolean;
  data?: PassInfo;
  error?: string;
}

export const usePassVerification = (onVerified?: (passInfo: PassInfo) => void) => {
  const popupRef = useRef<Window | null>(null);
  const onVerifiedRef = useRef(onVerified);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onVerifiedRef.current = onVerified;
  }, [onVerified]);

  useEffect(() => {
    const receivePassResult = (event: MessageEvent<PassResultMessage>) => {
      if (event.origin !== window.location.origin || event.data?.type !== PASS_RESULT_MESSAGE) return;
      if (popupRef.current && event.source !== popupRef.current) return;

      setIsLoading(false);
      if (!event.data.success || !event.data.data) {
        setError(event.data.error ?? "PASS 인증 결과를 확인하지 못했습니다.");
        return;
      }

      setError(null);
      onVerifiedRef.current?.(event.data.data);
    };

    window.addEventListener("message", receivePassResult);
    return () => window.removeEventListener("message", receivePassResult);
  }, []);

  useEffect(() => {
    if (!isLoading) return;

    const popupWatcher = window.setInterval(() => {
      if (!popupRef.current?.closed) return;
      popupRef.current = null;
      setIsLoading(false);
      setError("PASS 인증 창이 닫혔습니다. 인증을 다시 진행해 주세요.");
    }, 500);

    return () => window.clearInterval(popupWatcher);
  }, [isLoading]);

  const startVerification = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    const popup = window.open("", "entrydsm-pass-auth", "width=500,height=720,scrollbars=yes,resizable=yes");
    if (!popup) {
      setIsLoading(false);
      setError("팝업이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요.");
      return;
    }

    popupRef.current = popup;
    popup.document.write(
      '<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>PASS 인증</title></head>' +
        '<body style="font-family:sans-serif;text-align:center;padding-top:48px">PASS 인증을 준비하고 있습니다.</body></html>'
    );
    popup.document.close();

    try {
      const redirectUrl = `${window.location.origin}/pass/result`;
      const popupHtml = await createPassPopup(redirectUrl);

      if (popup.closed) throw new Error("PASS 인증 창이 닫혔습니다.");
      popup.document.open();
      popup.document.write(popupHtml);
      popup.document.close();
    } catch (cause) {
      popup.close();
      setIsLoading(false);
      setError(cause instanceof Error ? cause.message : "PASS 인증을 시작하지 못했습니다.");
    }
  }, []);

  const cancelVerification = useCallback(() => {
    popupRef.current?.close();
    popupRef.current = null;
    setIsLoading(false);
    setError(null);
  }, []);

  return { startVerification, cancelVerification, isLoading, error };
};

export { PASS_RESULT_MESSAGE };
