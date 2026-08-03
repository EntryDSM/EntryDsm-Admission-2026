import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout, CalculateLayout } from "./layout";

// TODO: 자기가 개발한 부분 라우터만 주석 해제하고 수정하기 - 작년 라우터 코드임

// import {
//   Landing,
//   NoticeDetailPage,
//   AdmissionOverviewPage,
//   MyPage,
//   FaqPage,
//   ScoreFirst,
//   ScoreSecond,
//   ScoreThird,
//   Activity,
//   QEDScore,
//   Main,
//   NoticePage,
//   Page404,
//   ErrorFixingPage,
//   ReturnSoon,
// } from './pages';

export const Router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        // element: <Main />,
      },
      {
        path: "/landing",
        // element: <Landing />,
      },
      {
        path: "/notice",
        // element: <NoticePage />,
      },
      {
        path: "/notice/:id",
        // element: <NoticeDetailPage />,
      },
      {
        path: "/faq",
        // element: <FaqPage />,
      },
      {
        path: "/admission-overview",
        // element: <AdmissionOverviewPage />,
      },
      {
        path: "/mypage",
        // element: <MyPage />,
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
          // 가듨예정자 플로우
          {
            path: "primary/first-graduate",
            // element: <ScoreFirst />,
          },
          {
            path: "primary/second-graduate",
            // element: <ScoreSecond />,
          },
          {
            path: "primary/third-graduate",
            // element: <ScoreThird />,
          },
          {
            path: "primary/activity",
            // element: <Activity />,
          },
          {
            path: "graduated/third2",
            // element: <ScoreThird />,
          },
          {
            path: "graduated/third1",
            // element: <ScoreSecond />,
          },
          {
            path: "graduated/second2",
            // element: <ScoreFirst />,
          },
          {
            path: "graduated/second1",
            // element: <ScoreThird />,
          },
          {
            path: "graduated/activity",
            // element: <Activity />,
          },
          // 검정고시 플로우
          {
            path: "qe/score",
            // element: <QEDScore />,
          },
          {
            path: "qe/activity",
            // element: <Activity />,
          },
        ],
      },
    ],
  },
  {
    path: "/return_soon",
    // element: <ReturnSoon />,
  },
  {
    path: "*",
    // element: <Page404 />,
  },
]);
