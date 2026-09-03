import { Flex } from "@entry/design";
import { AttendanceForm, usePageData } from "@entry/ui";

const SUBJECTS = [
  { key: "kor", title: "국어", text: "국어 성적을 입력하세요" },
  { key: "soc", title: "사회", text: "사회 성적을 입력하세요" },
  { key: "his", title: "역사", text: "역사 성적을 입력하세요" },
  { key: "sci", title: "과학", text: "과학 성적을 입력하세요" },
  { key: "tech", title: "기술 가정", text: "기술 가정 성적을 입력하세요" },
  { key: "math", title: "수학", text: "수학 성적을 입력하세요" },
  { key: "eng", title: "영어", text: "영어 성적을 입력하세요" },
] as const;

export const GedScore = () => {
  const [datas, setDatas] = usePageData("gedScore");
  const safeData = datas ?? ({} as Record<(typeof SUBJECTS)[number]["key"], string | number | null>);

  const handleChange = (key: string) => (value: string) => {
    setDatas({ ...datas, [key]: value === "" ? null : value });
  };

  return (
    <div>
      <Flex isColumn={true} height="fit-content" flexWrap="wrap" width="100%" gapX={22} gapY={24}>
        {SUBJECTS.map(({ key, title, text }) => (
          <AttendanceForm
            key={key}
            onChange={handleChange(key)}
            width="100%"
            fontSize={20}
            fontWeight={500}
            inputWidth="473px"
            title={title}
            text={text}
            layout="row"
            value={safeData[key] ?? null}
            maxScore={100}
          />
        ))}
      </Flex>
    </div>
  );
};
