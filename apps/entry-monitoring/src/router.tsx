// router.tsx
import { createBrowserRouter } from "react-router";
import { AppLayout } from "./layout";
import { MonitoringPage } from "./pages/MonitoringPage";
import { mockMonitoringData } from "./pages/mockMonitoringData";
import { downloadCurrentPage, reloadCurrentPage } from "./utils";

export const Router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <div>페이지를 불러오는 중 오류가 발생했습니다.</div>,
    children: [
      {
        path: "/",
        element: (
          <MonitoringPage data={mockMonitoringData} onReload={reloadCurrentPage} onDownload={downloadCurrentPage} />
        ),
      },
    ],
  },
]);
