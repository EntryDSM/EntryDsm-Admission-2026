// router.tsx
import { createBrowserRouter } from "react-router";
import { AppLayout } from "./layout";
import { MonitoringPage } from "./pages/MonitoringPage";
import { mockMonitoringData } from "./pages/mockMonitoringData";

export const Router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <MonitoringPage data={mockMonitoringData} />,
      },
    ],
  },
]);
