import { createBrowserRouter } from "react-router";
import { AppLayout } from "./layout";
import { ErrorPage } from "@entry/ui";
import {
  AdmissionsSchedule,
  ApplicantsList,
  FormulaCalculator,
  NoticeList,
  NoticeCreate,
  NoticeEdit,
  StatisticsLandingPage,
  AdmissionsQuota,
} from "./pages";

export const Router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <StatisticsLandingPage />,
      },
      {
        path: "formula-calculator",
        element: <FormulaCalculator />,
      },
      {
        path: "applicants-list",
        element: <ApplicantsList />,
      },
      {
        path: "admissions-schedule",
        element: <AdmissionsSchedule />,
      },
      {
        path: "notice",
        element: <NoticeList />,
      },
      {
        path: "notice/create",
        element: <NoticeCreate />,
      },
      {
        path: "notice/edit/:id",
        element: <NoticeEdit />,
      },
      {
        path: "admissions-quota",
        element: <AdmissionsQuota />,
      },
    ],
  },
  {
    path: "*",
    element: <ErrorPage errorMsg="404 Page Not Found" />,
  },
]);
