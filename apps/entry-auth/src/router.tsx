import { createBrowserRouter } from "react-router";
import { AppLayout } from "./layout";
import LoginPage from "./pages/Login";
import { SignUpPage } from "./pages/Signup";

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
    ],
  },
]);
