import { RouterProvider } from "react-router";
import { ToastContainer } from "react-toastify";
import { GlobalStyle } from "@entry/design";
import { useSessionMonitoring } from "@entry/hooks";
import { Router } from "./router";

const App = () => {
  useSessionMonitoring({ service: "AUTH", apiBaseUrl: import.meta.env.VITE_IDENTITY_API_URL });

  return (
    <>
      <RouterProvider router={Router} />
      <ToastContainer />
      <GlobalStyle />
    </>
  );
};

export default App;
