import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Router } from "./Router";
import { GlobalStyle } from "@entry/design";
import { ToastContainer } from "react-toastify";

export default function App() {
  useEffect(() => {
    // entrydsm.hs.kr 또는 www.entrydsm.hs.kr 감지 시 entrydsm.kr로 리다이렉트
    const hostname = window.location.hostname;
    if (hostname === "entrydsm.hs.kr" || hostname === "www.entrydsm.hs.kr") {
      const newUrl = window.location.href
        .replace("entrydsm.hs.kr", "entrydsm.kr")
        .replace("www.entrydsm.hs.kr", "entrydsm.kr");
      window.location.replace(newUrl);
      return;
    }
  }, []);

  return (
    <>
      <RouterProvider router={Router} />
      <GlobalStyle />
      <ToastContainer />
    </>
  );
}
