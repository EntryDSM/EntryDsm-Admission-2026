import { RouterProvider } from "react-router";
import { Router } from "./Router";
import { GlobalStyle } from "@entry/design";
import { ApplicationDataProvider, CheckDataProvider } from "@entry/ui";

export const App = () => {
  return (
    <CheckDataProvider>
      <ApplicationDataProvider>
        <RouterProvider router={Router} />
        <GlobalStyle />
      </ApplicationDataProvider>
    </CheckDataProvider>
  );
};
