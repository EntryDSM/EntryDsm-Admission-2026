import { createBrowserRouter } from "react-router";
import {
  AppLayout,
  ApplicationLayout,
  GedScoreLayout,
  GraduateScoreLayout,
  ProspectiveGraduateScoreLayout,
  RootLayout,
} from "./layout";
import {
  ActivityGraduate,
  ApplicationClassification,
  MiddleSchoolInfo,
  PersonalStatements,
  StatementOfPurpose,
  Landing,
  ScoreFirst,
  ScoreFourth,
  ScoreSecond,
  ScoreThird,
  ApplicantInfo,
  SubmitCheck,
  Submitted,
  GuardianInfo,
} from "./pages";
import { ApplicationPreview } from "./pages/applicationCheck";
import { AttendanceVolunteer, GedScore } from "./pages/ged";
import { RequireAuth } from "./components/RequireAuth";
import { DocumentTitleOutlet, ErrorPage } from "@entry/ui";

export const Router = createBrowserRouter([
  {
    // 각 라우트의 handle.title로 브라우저 탭 제목("페이지명 | EntryAdmission")을 유지한다.
    element: <DocumentTitleOutlet defaultTitle="EntryAdmission" />,
    children: [
      {
        element: <RequireAuth />,
        children: [
          {
            path: "/",
            element: <RootLayout />,
            children: [
              {
                path: "",
                element: <Landing />,
              },
              {
                path: "",
                element: <AppLayout />,
                children: [
                  {
                    path: "",
                    element: <ApplicationLayout />,
                    children: [
                      {
                        path: "ged",
                        element: <GedScoreLayout />,
                        children: [
                          {
                            path: "score",
                            element: <GedScore />,
                            handle: { title: "검정고시 점수" },
                          },
                          {
                            path: "attendance-volunteer",
                            element: <AttendanceVolunteer />,
                            handle: { title: "자격증" },
                          },
                        ],
                      },
                      {
                        path: "",
                        element: <GraduateScoreLayout />,
                        children: [
                          {
                            path: "first-graduate",
                            element: <ScoreFirst pageKey={"firstGraduate"} />,
                            handle: { title: "3학년 2학기 성적" },
                          },
                          {
                            path: "second-graduate",
                            element: <ScoreSecond pageKey={"secondGraduate"} />,
                            handle: { title: "3학년 1학기 성적" },
                          },
                          {
                            path: "third-graduate",
                            element: <ScoreThird pageKey={"thirdGraduate"} />,
                            handle: { title: "2학년 2학기 성적" },
                          },
                          {
                            path: "fourth-graduate",
                            element: <ScoreFourth />,
                            handle: { title: "2학년 1학기 성적" },
                          },
                          {
                            path: "activity-graduate",
                            element: <ActivityGraduate pageKey={"activityGraduate"} />,
                            handle: { title: "출결 및 봉사" },
                          },
                        ],
                      },
                      {
                        path: "",
                        element: <ProspectiveGraduateScoreLayout />,
                        children: [
                          {
                            path: "first-prospective-graduate",
                            element: <ScoreFirst pageKey={"firstGraduateProspective"} />,
                            handle: { title: "3학년 1학기 성적" },
                          },
                          {
                            path: "second-prospective-graduate",
                            element: <ScoreSecond pageKey={"secondGraduateProspective"} />,
                            handle: { title: "2학년 2학기 성적" },
                          },
                          {
                            path: "third-prospective-graduate",
                            element: <ScoreThird pageKey={"thirdGraduateProspective"} />,
                            handle: { title: "2학년 1학기 성적" },
                          },
                          {
                            path: "activity-prospective-graduate",
                            element: <ActivityGraduate pageKey={"activityGraduateProspective"} />,
                            handle: { title: "출결 및 봉사" },
                          },
                        ],
                      },
                      {
                        path: "application-classification",
                        element: <ApplicationClassification />,
                        handle: { title: "지원자 유형 구분" },
                      },
                      {
                        path: "applicant-info",
                        element: <ApplicantInfo />,
                        handle: { title: "지원자 인적사항" },
                      },
                      {
                        path: "guardian-info",
                        element: <GuardianInfo />,
                        handle: { title: "보호자 인적사항" },
                      },
                      {
                        path: "middle-school-info",
                        element: <MiddleSchoolInfo />,
                        handle: { title: "중학교 정보 입력" },
                      },
                      {
                        path: "personal-statements",
                        element: <PersonalStatements />,
                        handle: { title: "자기소개서" },
                      },
                      {
                        path: "statement-of-purpose",
                        element: <StatementOfPurpose />,
                        handle: { title: "학업계획서" },
                      },
                      {
                        path: "submit-check",
                        element: <SubmitCheck />,
                        handle: { title: "원서 제출" },
                      },
                      {
                        path: "application-preview",
                        element: <ApplicationPreview />,
                        handle: { title: "원서 미리보기" },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            path: "submitted",
            element: <Submitted />,
            handle: { title: "제출 완료" },
          },
        ],
      },
      {
        path: "*",
        element: <ErrorPage status={404} />,
        handle: { title: "404" },
      },
    ],
  },
]);
