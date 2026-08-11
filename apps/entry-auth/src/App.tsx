import { RouterProvider } from "react-router";
import { useSessionMonitoring } from "@entry/hooks";
import { Router } from "./router";

const App = () => {
  useSessionMonitoring({ service: "AUTH", apiBaseUrl: import.meta.env.VITE_API_BASE_URL });

  return <RouterProvider router={Router} />;
};

export default App;
