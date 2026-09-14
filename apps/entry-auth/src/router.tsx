import { createBrowserRouter } from "react-router";
import { DocumentTitleOutlet } from "@entry/ui";
import { AppLayout } from "./layout";
import { FindPasswordPage, SignUpPage, LoginPage, PassResultPage } from "./pages";

export const Router = createBrowserRouter([
  {
    // 각 라우트의 handle.title로 브라우저 탭 제목("페이지명 | EntryAuth")을 유지한다.
    element: <DocumentTitleOutlet defaultTitle="EntryAuth" />,
    children: [
      {
        path: "/pass/result",
        element: <PassResultPage />,
        handle: { title: "본인인증 결과" },
      },
      {
        path: "/",
        element: <AppLayout />,
        children: [
          {
            path: "/",
            element: <LoginPage />,
            handle: { title: "로그인" },
          },
          {
            path: "/signup",
            element: <SignUpPage />,
            handle: { title: "회원가입" },
          },
          {
            path: "/find-password",
            element: <FindPasswordPage />,
            handle: { title: "비밀번호 찾기" },
          },
        ],
      },
    ],
  },
]);
