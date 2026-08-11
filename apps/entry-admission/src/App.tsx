import { RouterProvider } from "react-router";
import { Router } from "./Router";
import { GlobalStyle } from "@entry/design";
import { useSessionMonitoring } from "@entry/hooks";
import { ApplicationDataProvider, CheckDataProvider } from "@entry/ui";

export const App = () => {
  useSessionMonitoring({ service: "APPLICATION", apiBaseUrl: import.meta.env.VITE_API_BASE_URL });

  return (
    <CheckDataProvider>
      <ApplicationDataProvider>
        <RouterProvider router={Router} />
        <GlobalStyle />
      </ApplicationDataProvider>
    </CheckDataProvider>
  );
};
