import { memo, useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { colors, Flex, Text } from "@entry/design";
import { Btn } from "@entry/ui";

import { DropDownSection } from "../components";
import { useSchedules, useUpdateSchedules } from "../hooks";
import { createDefaultScheduleFields, type ScheduleFieldView } from "../utils";

type EditablePart = "start" | "end";

interface ScheduleRowProps {
  field: ScheduleFieldView;
  /** 새 일정은 scheduleId 가 null 이라 행은 index 로 구분한다. */
  index: number;
  onChange: (index: number, part: EditablePart, value: string) => void;
}

/** 일정 한 건의 행. 다른 행만 바뀌면 다시 그리지 않는다. */
const ScheduleRow = memo(({ field, index, onChange }: ScheduleRowProps) => {
  const handleStartChange = useCallback((value: string) => onChange(index, "start", value), [onChange, index]);
  const handleEndChange = useCallback((value: string) => onChange(index, "end", value), [onChange, index]);

  return (
    <Flex width="100%" height="auto" isColumn={true} gap={8}>
      <Text fontSize={22} fontWeight={600}>
        {field.title}
      </Text>
      <DropDownSection onChange={handleStartChange} label="시작" value={field.start} />
      <DropDownSection onChange={handleEndChange} label="종료" value={field.end} />
    </Flex>
  );
});

ScheduleRow.displayName = "ScheduleRow";

export const AdmissionsSchedule = () => {
  const navigate = useNavigate();
  const { schedules, isLoading, isError, isSuccess, refetch } = useSchedules();
  const { updateSchedules, isUpdating } = useUpdateSchedules();

  // 등록된 일정이 없으면 기본 일정을 띄워 바로 등록하게 한다.
  const isRegisterMode = isSuccess && schedules.length === 0;

  // 저장 전까지는 서버 값과 분리된 편집 상태를 쓴다.
  // 빈 목록이 이미 캐시돼 있으면 아래 동기화가 걸리지 않아, 처음부터 기본 일정을 넣는다.
  const [fields, setFields] = useState<ScheduleFieldView[]>(() =>
    isRegisterMode ? createDefaultScheduleFields() : schedules
  );
  // 편집 중에는 재조회가 입력을 덮지 않게 동기화하지 않는다.
  const [isDirty, setIsDirty] = useState(false);
  const [syncedSchedules, setSyncedSchedules] = useState(schedules);

  // 편집 중이 아니고 조회 결과가 바뀌었을 때만 동기화한다.
  if (!isDirty && schedules !== syncedSchedules) {
    setSyncedSchedules(schedules);
    setFields(isRegisterMode ? createDefaultScheduleFields() : schedules);
  }

  const handleFieldChange = useCallback((index: number, part: EditablePart, value: string) => {
    setIsDirty(true);
    setFields(prev => prev.map((field, fieldIndex) => (fieldIndex === index ? { ...field, [part]: value } : field)));
  }, []);

  // 모든 일정의 시각을 입력하기 전에는 저장을 막는다.
  const hasIncompleteField = fields.some(field => !field.start || !field.end);
  const isSaveBlocked = isLoading || isUpdating || fields.length === 0 || hasIncompleteField;

  const handleSaveClick = () => {
    if (isSaveBlocked) {
      return;
    }
    // 저장이 끝나면 다시 서버 값과 동기화한다.
    updateSchedules(fields, { onSettled: () => setIsDirty(false) });
  };

  const saveLabel = isRegisterMode ? "등록" : "저장";

  return (
    <Flex isColumn={true} width="100%" height="auto" gap={20}>
      <Flex width="100%" height="fit-content" justifyContent="space-between" alignItems="center">
        <Text fontSize={32} fontWeight={700}>
          {isRegisterMode ? "전형 일정 등록" : "전형 일정 수정"}
        </Text>
        <Flex width="fit-content" height="fit-content" gap={12}>
          <Btn
            onClick={handleSaveClick}
            isBlocked={isSaveBlocked}
            backgroundColor={colors.green[500]}
            hoverBackgroundColor="none"
          >
            {isUpdating ? `${saveLabel} 중...` : saveLabel}
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
        ) : isError && fields.length === 0 ? (
          <Flex width="fit-content" height="fit-content" isColumn={true} gap={12}>
            <Text fontSize={16} color={colors.gray[400]}>
              전형 일정을 불러오지 못했습니다.
            </Text>
            <Btn onClick={() => refetch()} backgroundColor={colors.green[500]} hoverBackgroundColor="none">
              다시 시도
            </Btn>
          </Flex>
        ) : (
          <>
            {isRegisterMode && (
              <Text fontSize={16} color={colors.gray[400]}>
                등록된 전형 일정이 없습니다. 모든 일정의 시작/종료 시각을 입력하면 바로 등록할 수 있습니다.
              </Text>
            )}
            {fields.map((field, index) => (
              <ScheduleRow
                key={field.scheduleId ?? field.title}
                field={field}
                index={index}
                onChange={handleFieldChange}
              />
            ))}
          </>
        )}
      </Flex>
    </Flex>
  );
};
