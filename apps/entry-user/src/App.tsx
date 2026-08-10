import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { Router } from "./Router";
import { GlobalStyle } from "@entry/design";
import { ToastContainer } from "react-toastify";

export default function App() {
  useEffect(() => {
    // entrydsm.hs.kr 또는 www.entrydsm.hs.kr 감지 시 entrydsm.kr로 리다이렉트
    const hostname = window.location.hostname;
    if (hostname === "entrydsm.hs.kr" || hostname === "www.entrydsm.hs.kr") {
      const newUrl =
        `${window.location.protocol}//entrydsm.kr` +
        `${window.location.pathname}${window.location.search}${window.location.hash}`;
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
