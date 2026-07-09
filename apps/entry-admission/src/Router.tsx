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
  Page404,
} from "./pages";
import { ApplicationPreview } from "./pages/applicationCheck";
import { AttendanceVolunteer, GedScore } from "./pages/ged";

export const Router = createBrowserRouter([
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
                  },
                  {
                    path: "attendance-volunteer",
                    element: <AttendanceVolunteer />,
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
                  },
                  {
                    path: "second-graduate",
                    element: <ScoreSecond pageKey={"secondGraduate"} />,
                  },
                  {
                    path: "third-graduate",
                    element: <ScoreThird pageKey={"thirdGraduate"} />,
                  },
                  {
                    path: "fourth-graduate",
                    element: <ScoreFourth />,
                  },
                  {
                    path: "activity-graduate",
                    element: <ActivityGraduate pageKey={"activityGraduate"} />,
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
                  },
                  {
                    path: "second-prospective-graduate",
                    element: <ScoreSecond pageKey={"secondGraduateProspective"} />,
                  },
                  {
                    path: "third-prospective-graduate",
                    element: <ScoreThird pageKey={"thirdGraduateProspective"} />,
                  },
                  {
                    path: "activity-prospective-graduate",
                    element: <ActivityGraduate pageKey={"activityGraduateProspective"} />,
                  },
                ],
              },
              {
                path: "application-classification",
                element: <ApplicationClassification />,
              },
              {
                path: "applicant-info",
                element: <ApplicantInfo />,
              },
              {
                path: "guardian-info",
                element: <GuardianInfo />,
              },
              {
                path: "middle-school-info",
                element: <MiddleSchoolInfo />,
              },
              {
                path: "personal-statements",
                element: <PersonalStatements />,
              },
              {
                path: "statement-of-purpose",
                element: <StatementOfPurpose />,
              },
              {
                path: "submit-check",
                element: <SubmitCheck />,
              },
              {
                path: "application-preview",
                element: <ApplicationPreview />,
              },
            ],
          },
        ],
      },
      {
        path: "submitted",
        element: <Submitted />,
      },
    ],
  },
  {
    path: "*",
    element: <Page404 />,
  },
]);
