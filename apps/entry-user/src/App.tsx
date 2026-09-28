import { RouterProvider } from "react-router";
import { Router } from "./Router";
import { GlobalStyle } from "@entry/design";
import { ToastContainer } from "react-toastify";
import { NoticeModal } from "./components";

export default function App() {
  return (
    <>
      <RouterProvider router={Router} />
      <GlobalStyle />
      <ToastContainer />
      {/* public/NoticeImg 의 이미지를 파일명 순으로 한 장씩 띄운다. 공지를 내리려면 폴더의 이미지를 지운다. */}
      <NoticeModal />
    </>
  );
}
