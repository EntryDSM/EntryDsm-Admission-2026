import { RouterProvider } from "react-router";
import { GlobalStyle } from "@entry/design";
import { ToastContainer } from "react-toastify";

import { Router } from "./router";

export const App = () => {
  return (
    <>
      <RouterProvider router={Router} />
      <ToastContainer />
      <GlobalStyle />
    </>
  );
};
