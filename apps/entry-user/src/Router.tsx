import { createBrowserRouter, Navigate } from "react-router";
import { DocumentTitleOutlet, ErrorPage } from "@entry/ui";
import { AppLayout, CalculateLayout } from "./layout";

// TODO: 자기가 개발한 부분 라우터만 주석 해제하고 수정하기 - 작년 라우터 코드임
import {
  Landing,
  NoticeDetailPage,
  AdmissionOverviewPage,
  MyPage,
  ApplicationResultPage,
  FaqPage,
  ScoreFirst,
  ScoreSecond,
  ScoreThird,
  ScoreFourth,
  Activity,
  QEDScore,
  Main,
  NoticePage,
  //ErrorFixingPage,
  ReturnSoon,
} from "./pages";

export const Router = createBrowserRouter([
  {
    // 각 라우트의 handle.title로 브라우저 탭 제목("페이지명 | EntryDSM")을 유지한다.
    // 제목이 없는 라우트(홈)는 index.html의 기본 제목을 그대로 쓴다 (docs/SEO.md 6절).
    element: (
      <DocumentTitleOutlet defaultTitle="EntryDSM | 대덕소프트웨어마이스터고등학교 입학전형" suffix="EntryDSM" />
    ),
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          {
            path: "/",
            element: <Main />,
          },
          {
            path: "/landing",
            element: <Landing />,
            handle: { title: "학교 소개" },
          },
          {
            path: "/notice",
            element: <NoticePage />,
            handle: { title: "공지사항" },
          },
          {
            // 데이터 로드 후 페이지 안에서 usePageTitle로 실제 공지 제목으로 덮어쓴다.
            path: "/notice/:id",
            element: <NoticeDetailPage />,
            handle: { title: "공지사항" },
          },
          {
            path: "/faq",
            element: <FaqPage />,
            handle: { title: "자주 묻는 질문" },
          },
          {
            path: "/admission-overview",
            element: <AdmissionOverviewPage />,
            handle: { title: "전형 요강" },
          },
          {
            path: "/mypage",
            element: <MyPage />,
            handle: { title: "마이페이지" },
          },
          {
            // 마이페이지 "합격 결과 확인" → 합격자 발표. 로드 후 페이지 안에서 usePageTitle로 회차 제목(1차/최종)으로 덮어쓴다.
            path: "/mypage/result",
            element: <ApplicationResultPage />,
            handle: { title: "합격자 발표" },
          },
          {
            path: "/error_fixing",
            // element: <ErrorFixingPage />,
          },
          {
            path: "/calculate",
            element: <CalculateLayout />,
            children: [
              // 기본 리다이렉트
              {
                path: "",
                element: <Navigate to="/calculate/primary/first-graduate" replace />,
              },
              // 졸업예정자 플로우
              {
                path: "primary/first-graduate",
                element: <ScoreFirst pageKey="primaryFirst" />,
                handle: { title: "모의 성적 계산 - 3학년 1학기" },
              },
              {
                path: "primary/second-graduate",
                element: <ScoreSecond pageKey="primarySecond" />,
                handle: { title: "모의 성적 계산 - 직전 학기" },
              },
              {
                path: "primary/third-graduate",
                element: <ScoreThird pageKey="primaryThird" />,
                handle: { title: "모의 성적 계산 - 직전 전 학기" },
              },
              {
                path: "primary/activity",
                element: <Activity pageKey="primaryActivity" />,
                handle: { title: "모의 성적 계산 - 출결 및 봉사" },
              },
              {
                path: "graduated/third2",
                element: <ScoreThird pageKey="graduatedThird2" />,
                handle: { title: "모의 성적 계산 - 3학년 2학기" },
              },
              {
                path: "graduated/third1",
                element: <ScoreSecond pageKey="graduatedThird1" />,
                handle: { title: "모의 성적 계산 - 3학년 1학기" },
              },
              {
                path: "graduated/second2",
                element: <ScoreFirst pageKey="graduatedSecond2" />,
                handle: { title: "모의 성적 계산 - 2학년 2학기" },
              },
              {
                path: "graduated/second1",
                element: <ScoreFourth pageKey="graduatedSecond1" />,
                handle: { title: "모의 성적 계산 - 2학년 1학기" },
              },
              {
                path: "graduated/activity",
                element: <Activity pageKey="graduatedActivity" />,
                handle: { title: "모의 성적 계산 - 출결 및 봉사" },
              },
              // 검정고시 플로우
              {
                path: "qe/score",
                element: <QEDScore />,
                handle: { title: "모의 성적 계산 - 검정고시 점수" },
              },
              {
                path: "qe/activity",
                element: <Activity pageKey="qeActivity" />,
                handle: { title: "모의 성적 계산 - 출결 및 봉사" },
              },
            ],
          },
        ],
      },
      {
        path: "/return_soon",
        element: <ReturnSoon />,
        handle: { title: "오류" },
      },
      {
        path: "*",
        element: <ErrorPage status={404} homeHref="/" />,
        handle: { title: "404" },
      },
    ],
  },
]);
