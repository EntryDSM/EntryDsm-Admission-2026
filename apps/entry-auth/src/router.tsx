import { createBrowserRouter } from "react-router";
import { AppLayout } from "./layout";
import LoginPage from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignupPage";
import { FindPasswordPage } from "./pages/FindPasswordPage";

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
