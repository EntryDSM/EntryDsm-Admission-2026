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
    // handle.title 로 탭 제목("페이지명 | EntryAdmin")을 정한다.
    element: <DocumentTitleOutlet defaultTitle="EntryAdmin" />,
    children: [
      {
        // 모든 페이지는 들어올 때마다 ADMIN 권한을 확인한다.
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
                // 준비 중이라 라우트만 막는다(페이지는 남겨 둔다).
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
