import { createBrowserRouter } from "react-router";
import { AppLayout } from "./layout";

export const Router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        // element: <LoginPage />,
      },
    ],
  },
]);
