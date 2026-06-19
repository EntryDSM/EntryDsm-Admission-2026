import { colors, Flex, Text } from "@entry/design";
import { Btn } from "@entry/ui";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { DropDownSection } from "../components";

type ScheduleData = {
  applicationStart: string;
  applicationEnd: string;
  firstAnnouncement: string;
  interview: string;
  finalAnnouncement: string;
};

const INITIAL_SCHEDULE_DATA: ScheduleData = {
  applicationStart: "",
  applicationEnd: "",
  firstAnnouncement: "",
  interview: "",
  finalAnnouncement: "",
};

const SCHEDULE_FIELDS: { key: keyof ScheduleData; label: string }[] = [
  { key: "applicationStart", label: "원서 제출 시작" },
  { key: "applicationEnd", label: "원서 제출 마감" },
  { key: "firstAnnouncement", label: "1차 발표" },
  { key: "interview", label: "심층 면접" },
  { key: "finalAnnouncement", label: "최종 발표" },
];

export const AdmissionsSchedule = () => {
  const navigate = useNavigate();
  const [datas, setDatas] = useState<ScheduleData>(INITIAL_SCHEDULE_DATA);

  const handleChange = useCallback(
    (key: keyof ScheduleData) => (value: string) => {
      setDatas(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSaveClick = () => undefined;

  return (
    <Flex isColumn={true} width="100%" height="auto" gap={20}>
      <Flex width="100%" height="fit-content" justifyContent="space-between" alignItems="center">
        <Text fontSize={32} fontWeight={700}>
          전형 일정 수정
        </Text>
        <Flex width="fit-content" height="fit-content" gap={12}>
          <Btn onClick={handleSaveClick} backgroundColor={colors.green[500]} hoverBackgroundColor="none">
            저장
          </Btn>
          <Btn
            onClick={() => navigate(-1)}
            backgroundColor={colors.gray[50]}
            hoverBackgroundColor="none"
            borderColor={colors.gray[200]}
            color={colors.gray[500]}
          >
            취소
          </Btn>
        </Flex>
      </Flex>
      <Flex width="100%" height="auto" isColumn={true} gap={16}>
        {SCHEDULE_FIELDS.map(field => (
          <DropDownSection
            key={field.key}
            onChange={handleChange(field.key)}
            label={field.label}
            value={datas[field.key]}
          />
        ))}
      </Flex>
    </Flex>
  );
};
