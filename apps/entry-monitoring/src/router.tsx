import { createBrowserRouter } from "react-router";
import { downloadCurrentPage, reloadCurrentPage } from "./actions";
import { RequireAdmin } from "./components";
import { AppLayout } from "./layout";
import { MonitoringPageContainer } from "./pages";

export const Router = createBrowserRouter([
  {
    element: <RequireAdmin />,
    errorElement: <div>페이지를 불러오는 중 오류가 발생했습니다.</div>,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/",
            element: <MonitoringPageContainer onReload={reloadCurrentPage} onDownload={downloadCurrentPage} />,
          },
        ],
      },
    ],
  },
]);
