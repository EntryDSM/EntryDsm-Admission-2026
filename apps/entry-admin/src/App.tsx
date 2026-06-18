import { RouterProvider } from "react-router";
import { Router } from "./Router";
import { GlobalStyle } from "@entry/design";
import { ToastContainer } from "react-toastify";

export const App = () => {
  return (
    <>
      <RouterProvider router={Router} />
      <ToastContainer />
      <GlobalStyle />
    </>
  );
};
