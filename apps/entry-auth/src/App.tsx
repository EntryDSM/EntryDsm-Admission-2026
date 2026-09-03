import { RouterProvider } from "react-router";
import { ToastContainer } from "react-toastify";
import { GlobalStyle } from "@entry/design";
import { Router } from "./router";

const App = () => {
  return (
    <>
      <RouterProvider router={Router} />
      <ToastContainer />
      <GlobalStyle />
    </>
  );
};

export default App;
