import { RouterProvider } from "react-router";
import { Router } from "./Router";
import { GlobalStyle } from "@entry/design";
import { ToastContainer } from "react-toastify";

export default function App() {
  return (
    <>
      <RouterProvider router={Router} />
      <GlobalStyle />
      <ToastContainer />
    </>
  );
}
