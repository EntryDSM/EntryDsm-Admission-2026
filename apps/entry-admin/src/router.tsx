import { createBrowserRouter } from "react-router";
import { ErrorPage } from "@entry/ui";

import { AppLayout } from "./layout";
import { UnderConstructionRedirect } from "./components";
import {
  AdmissionsSchedule,
  ApplicantsList,
  NoticeList,
  NoticeCreate,
  NoticeEdit,
  StatisticsLandingPage,
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
        // 준비 중 — 페이지(FormulaCalculator)는 유지하되 라우트만 임시 차단한다.
        path: "formula-calculator",
        element: <UnderConstructionRedirect pageName="계산식 수정" />,
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
        // 준비 중 — 페이지(AdmissionsQuota)는 유지하되 라우트만 임시 차단한다.
        path: "admissions-quota",
        element: <UnderConstructionRedirect pageName="정원 수정" />,
      },
    ],
  },
  {
    path: "*",
    element: <ErrorPage errorMsg="404 Page Not Found" />,
  },
]);
