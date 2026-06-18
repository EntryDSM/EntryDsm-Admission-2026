import { colors, Flex, Text } from "@entry/design";
import { Btn } from "@entry/ui";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { DropDownSection } from "../components";

export const AdmissionsSchedule = () => {
  const navigate = useNavigate();
  const [datas, setDatas] = useState<{
    applicationStart: string;
    applicationEnd: string;
    firstAnnouncement: string;
    interview: string;
    finalAnnouncement: string;
  }>({
    applicationStart: "",
    applicationEnd: "",
    firstAnnouncement: "",
    interview: "",
    finalAnnouncement: "",
  });

  const handleChange = useCallback(
    (key: keyof typeof datas) => (value: string) => {
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
        <DropDownSection
          onChange={handleChange("applicationStart")}
          label={"원서 제출 시작"}
          value={datas.applicationStart}
        />
        <DropDownSection
          onChange={handleChange("applicationEnd")}
          label={"원서 제출 마감"}
          value={datas.applicationEnd}
        />
        <DropDownSection
          onChange={handleChange("firstAnnouncement")}
          label={"1차 발표"}
          value={datas.firstAnnouncement}
        />
        <DropDownSection onChange={handleChange("interview")} label={"심층 면접"} value={datas.interview} />
        <DropDownSection
          onChange={handleChange("finalAnnouncement")}
          label={"최종 발표"}
          value={datas.finalAnnouncement}
        />
      </Flex>
    </Flex>
  );
};
