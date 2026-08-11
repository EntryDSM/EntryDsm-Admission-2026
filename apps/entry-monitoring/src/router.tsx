// router.tsx
import { createBrowserRouter } from "react-router";
import { downloadCurrentPage, reloadCurrentPage } from "./actions";
import { AppLayout } from "./layout";
import { MonitoringPageContainer } from "./pages";

export const Router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <div>페이지를 불러오는 중 오류가 발생했습니다.</div>,
    children: [
      {
        path: "/",
        element: <MonitoringPageContainer onReload={reloadCurrentPage} onDownload={downloadCurrentPage} />,
      },
    ],
  },
]);
