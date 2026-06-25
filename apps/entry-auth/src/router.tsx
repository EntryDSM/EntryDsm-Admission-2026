import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./layout";
import LoginPage from "./pages/Login";

export const Router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <LoginPage />,
      },
    ],
  },
]);
