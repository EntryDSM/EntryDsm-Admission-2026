import { createBrowserRouter } from "react-router";
import { DocumentTitleOutlet, ErrorPage } from "@entry/ui";

import { AppLayout } from "./layout";
import { RequireAdmin, UnderConstructionRedirect } from "./components";
import {
  AdmissionsQuota,
  AdmissionsSchedule,
  ApplicantsList,
  NoticeList,
  NoticeCreate,
  NoticeEdit,
  StatisticsLandingPage,
} from "./pages";

export const Router = createBrowserRouter([
  {
    // 각 라우트의 handle.title로 브라우저 탭 제목("페이지명 | EntryAdmin")을 유지한다.
    element: <DocumentTitleOutlet defaultTitle="EntryAdmin" />,
    children: [
      {
        // 모든 어드민 페이지는 접근 시마다 권한(ADMIN) 확인을 통과해야 한다.
        path: "/",
        element: <RequireAdmin />,
        children: [
          {
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
                handle: { title: "지원자 조회" },
              },
              {
                path: "admissions-schedule",
                element: <AdmissionsSchedule />,
                handle: { title: "일정 수정" },
              },
              {
                path: "notice",
                element: <NoticeList />,
                handle: { title: "공지사항" },
              },
              {
                path: "notice/create",
                element: <NoticeCreate />,
                handle: { title: "공지사항 작성" },
              },
              {
                path: "notice/edit/:id",
                element: <NoticeEdit />,
                handle: { title: "공지사항 수정" },
              },
              {
                path: "admissions-quota",
                element: <AdmissionsQuota />,
                handle: { title: "정원 수정" },
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: <ErrorPage status={404} homeHref="/" />,
        handle: { title: "404" },
      },
    ],
  },
]);
