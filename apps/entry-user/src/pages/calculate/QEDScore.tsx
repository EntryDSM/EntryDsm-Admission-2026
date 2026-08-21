import styled from "@emotion/styled";
import { Flex } from "@entry/design";
import { AttendanceForm } from "@entry/ui";
import { useCalculationPageData, type CalculationState } from "../../contexts";

const SUBJECTS = [
  { key: "korean", title: "국어", text: "국어 성적을 입력하세요" },
  { key: "social", title: "사회", text: "사회 성적을 입력하세요" },
  { key: "history", title: "역사", text: "역사 성적을 입력하세요" },
  { key: "science", title: "과학", text: "과학 성적을 입력하세요" },
  { key: "technology", title: "기술 가정", text: "기술 가정 성적을 입력하세요" },
  { key: "math", title: "수학", text: "수학 성적을 입력하세요" },
  { key: "english", title: "영어", text: "영어 성적을 입력하세요" },
] as const;

export const QEDScore = () => {
  const [datas, setDatas] = useCalculationPageData("qeScore");
  const safeData: CalculationState["qeScore"] = datas;

  const handleChange = (key: (typeof SUBJECTS)[number]["key"]) => (value: string) => {
    setDatas({ ...datas, [key]: value === "" ? null : value });
  };

  return (
    <Container>
      <Flex isColumn={true} height="fit-content" flexWrap="wrap" width="100%" gapX={22} gapY={24}>
        {SUBJECTS.map(({ key, title, text }) => (
          <AttendanceForm
            key={key}
            onChange={handleChange(key)}
            width="100%"
            fontSize={20}
            fontWeight={500}
            inputWidth="473px"
            value={safeData[key] ?? null}
            title={title}
            text={text}
            layout="row"
            maxScore={100}
          />
        ))}
      </Flex>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 48px;
  width: 100%;
  height: fit-content;
`;
