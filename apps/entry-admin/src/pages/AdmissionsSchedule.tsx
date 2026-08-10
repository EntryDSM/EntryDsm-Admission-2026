import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { colors, Flex, Text } from "@entry/design";
import { Btn } from "@entry/ui";

import { DropDownSection } from "../components";
import { useSchedules, useUpdateSchedules } from "../hooks";
import type { ScheduleFieldView } from "../utils";

type EditablePart = "start" | "end";

export const AdmissionsSchedule = () => {
  const navigate = useNavigate();
  const { schedules, isLoading } = useSchedules();
  const { updateSchedules, isUpdating } = useUpdateSchedules();

  // 조회 결과를 로컬 편집 상태로 복사해 저장 전까지 서버 캐시와 분리한다.
  const [fields, setFields] = useState<ScheduleFieldView[]>([]);

  useEffect(() => {
    setFields(schedules);
  }, [schedules]);

  const handleChange = useCallback(
    (scheduleId: number, part: EditablePart) => (value: string) => {
      setFields(prev => prev.map(field => (field.scheduleId === scheduleId ? { ...field, [part]: value } : field)));
    },
    []
  );

  const handleSaveClick = () => {
    if (isUpdating || fields.length === 0) {
      return;
    }
    updateSchedules(fields);
  };

  const isSaveBlocked = isLoading || isUpdating || fields.length === 0;

  return (
    <Flex isColumn={true} width="100%" height="auto" gap={20}>
      <Flex width="100%" height="fit-content" justifyContent="space-between" alignItems="center">
        <Text fontSize={32} fontWeight={700}>
          전형 일정 수정
        </Text>
        <Flex width="fit-content" height="fit-content" gap={12}>
          <Btn
            onClick={handleSaveClick}
            isBlocked={isSaveBlocked}
            backgroundColor={colors.green[500]}
            hoverBackgroundColor="none"
          >
            {isUpdating ? "저장 중..." : "저장"}
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

      <Flex width="100%" height="auto" isColumn={true} gap={24}>
        {isLoading && fields.length === 0 ? (
          <Text fontSize={16} color={colors.gray[400]}>
            전형 일정을 불러오는 중입니다...
          </Text>
        ) : fields.length === 0 ? (
          <Text fontSize={16} color={colors.gray[400]}>
            등록된 전형 일정이 없습니다.
          </Text>
        ) : (
          fields.map(field => (
            <Flex key={field.scheduleId} width="100%" height="auto" isColumn={true} gap={8}>
              <Text fontSize={22} fontWeight={600}>
                {field.title}
              </Text>
              <DropDownSection onChange={handleChange(field.scheduleId, "start")} label="시작" value={field.start} />
              <DropDownSection onChange={handleChange(field.scheduleId, "end")} label="종료" value={field.end} />
            </Flex>
          ))
        )}
      </Flex>
    </Flex>
  );
};
