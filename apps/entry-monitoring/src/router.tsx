import { createBrowserRouter } from "react-router";
import { AppLayout } from "./layout";
import { MonitoringPage } from "./pages";

export const Router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <MonitoringPage />,
      },
    ],
  },
]);
