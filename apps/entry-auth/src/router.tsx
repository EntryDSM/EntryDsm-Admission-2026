import { createBrowserRouter } from "react-router";
import { AppLayout } from "./layout";
import { FindPasswordPage, SignUpPage, LoginPage } from "./pages";

export const Router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <SignUpPage />,
      },
      {
        path: "/find-password",
        element: <FindPasswordPage />,
      },
    ],
  },
]);
