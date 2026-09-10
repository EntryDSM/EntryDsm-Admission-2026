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
  /** 신규(등록) 행은 scheduleId 가 null 이라 행 식별은 배열 index 로 한다. */
  index: number;
  onChange: (index: number, part: EditablePart, value: string) => void;
}

/**
 * 일정 한 건(시작/종료)을 렌더하는 memoized 행.
 * `field` 참조가 그대로면(=다른 행만 편집됨) 리렌더를 건너뛴다.
 * 부모의 `onChange` 는 안정적이라 행 내부 핸들러도 `index` 기준으로 안정적으로 유지된다.
 */
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

  // 조회가 성공했는데 목록이 비어 있으면(등록된 일정 없음) 조회 결과 대신 기본 일정을 띄워 바로 등록하게 한다.
  const isRegisterMode = isSuccess && schedules.length === 0;

  // 조회 결과를 로컬 편집 상태로 복사해 저장 전까지 서버 캐시와 분리한다.
  const [fields, setFields] = useState<ScheduleFieldView[]>(schedules);
  // 편집 중(dirty)에는 백그라운드 refetch 가 로컬 편집을 덮어쓰지 않게 동기화를 건너뛴다.
  const [isDirty, setIsDirty] = useState(false);
  // 마지막으로 동기화한 조회 결과 참조. 새 조회로 참조가 바뀌면 다시 동기화한다.
  const [syncedSchedules, setSyncedSchedules] = useState(schedules);

  // effect 대신 렌더 중 상태 조정(React 권장 패턴): 편집 중이 아니고 조회 결과가 바뀌었을 때만 동기화.
  if (!isDirty && schedules !== syncedSchedules) {
    setSyncedSchedules(schedules);
    setFields(isRegisterMode ? createDefaultScheduleFields() : schedules);
  }

  const handleFieldChange = useCallback((index: number, part: EditablePart, value: string) => {
    setIsDirty(true);
    setFields(prev => prev.map((field, fieldIndex) => (fieldIndex === index ? { ...field, [part]: value } : field)));
  }, []);

  // 등록 모드의 초기값은 빈 문자열이라, 모든 행의 시각이 입력되기 전에는 저장을 막는다.
  const hasIncompleteField = fields.some(field => !field.start || !field.end);
  const isSaveBlocked = isLoading || isUpdating || fields.length === 0 || hasIncompleteField;

  const handleSaveClick = () => {
    if (isSaveBlocked) {
      return;
    }
    // 저장이 성공/실패로 끝나면 dirty 를 해제해 서버 최신값과 다시 동기화되게 한다.
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
