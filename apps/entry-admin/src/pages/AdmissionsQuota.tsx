import { Fragment, type ChangeEvent, useCallback, useMemo, useState } from "react";
import { colors, Flex, Text } from "@entry/design";
import styled from "@emotion/styled";
import { Btn } from "@entry/ui";
import { useNavigate } from "react-router";

import type { AdmissionQuotaMap, AdmissionType } from "../apis";
import { InputSection } from "../components";
import { useAdmissionQuota, useUpdateAdmissionQuota } from "../hooks";
import { getAdmissionQuotaTotal, parseQuotaInput, QUOTA_ADMISSION_TYPES, toAdmissionQuotaMap } from "../utils";

/** 전형 이름. 요약 카드는 "○○ 전형", 입력칸은 "○○전형" 으로 조합한다. */
const ADMISSION_TYPE_NAMES: Record<AdmissionType, string> = {
  GENERAL: "일반",
  MEISTER: "마이스터",
  SOCIAL: "사회통합",
};

export const AdmissionsQuota = () => {
  const navigate = useNavigate();
  const { quota, isLoading, isError, isSuccess, refetch } = useAdmissionQuota();
  const { updateAdmissionQuota, isUpdating } = useUpdateAdmissionQuota();

  // 조회가 성공했는데 등록된 정원이 없으면(null) 0 으로 채운 입력칸을 띄워 바로 등록하게 한다.
  const isRegisterMode = isSuccess && quota === null;

  // 조회 결과를 로컬 편집 상태로 복사해 저장 전까지 서버 캐시와 분리한다 (AdmissionsSchedule 과 같은 패턴).
  const [quotas, setQuotas] = useState<AdmissionQuotaMap>(() => toAdmissionQuotaMap(quota));
  // 편집 중(dirty)에는 백그라운드 refetch 가 로컬 편집을 덮어쓰지 않게 동기화를 건너뛴다.
  const [isDirty, setIsDirty] = useState(false);
  // 마지막으로 동기화한 조회 결과 참조. 새 조회로 참조가 바뀌면 다시 동기화한다.
  const [syncedQuota, setSyncedQuota] = useState(quota);

  // effect 대신 렌더 중 상태 조정(React 권장 패턴): 편집 중이 아니고 조회 결과가 바뀌었을 때만 동기화.
  if (!isDirty && quota !== syncedQuota) {
    setSyncedQuota(quota);
    setQuotas(toAdmissionQuotaMap(quota));
  }

  // 전형 한 칸의 onChange handler
  const handleChange = useCallback(
    (admissionType: AdmissionType) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = parseQuotaInput(e.target.value);
      setIsDirty(true);
      setQuotas(prev => ({ ...prev, [admissionType]: value }));
    },
    []
  );

  // 입력값이 바뀔 때마다 총 인원을 다시 계산한다.
  const total = useMemo(() => getAdmissionQuotaTotal(quotas), [quotas]);

  const summaryItems = [
    ...QUOTA_ADMISSION_TYPES.map(admissionType => ({
      key: admissionType,
      label: `${ADMISSION_TYPE_NAMES[admissionType]} 전형`,
      value: quotas[admissionType],
    })),
    { key: "total", label: "총 인원", value: total },
  ];

  // 총 인원 0 명은 서버가 받아 주긴 하지만 실수일 수밖에 없으므로(등록 모드의 초기값), 한 칸이라도 입력하기 전에는 저장을 막는다.
  const isSaveBlocked = isLoading || isUpdating || total === 0;

  const handleSaveClick = () => {
    if (isSaveBlocked) {
      return;
    }
    // 저장이 성공/실패로 끝나면 dirty 를 해제해 서버 최신값과 다시 동기화되게 한다.
    updateAdmissionQuota(quotas, { onSettled: () => setIsDirty(false) });
  };

  const saveLabel = isRegisterMode ? "등록" : "저장";

  return (
    <Flex isColumn={true} width="100%" height="auto" gap={20}>
      <Flex width="100%" height="auto" alignItems="center" justifyContent="space-between">
        <Text fontSize={32} fontWeight={700}>
          {isRegisterMode ? "정원 등록" : "정원 수정"}
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

      {isLoading ? (
        <Text fontSize={16} color={colors.gray[400]}>
          모집 정원을 불러오는 중입니다...
        </Text>
      ) : isError && quota === undefined ? (
        <Flex width="fit-content" height="fit-content" isColumn={true} gap={12}>
          <Text fontSize={16} color={colors.gray[400]}>
            모집 정원을 불러오지 못했습니다.
          </Text>
          <Btn onClick={() => refetch()} backgroundColor={colors.green[500]} hoverBackgroundColor="none">
            다시 시도
          </Btn>
        </Flex>
      ) : (
        <>
          {isRegisterMode && (
            <Text fontSize={16} color={colors.gray[400]}>
              등록된 모집 정원이 없습니다. 전형별 정원을 입력하면 바로 등록할 수 있습니다.
            </Text>
          )}
          <AllContainer>
            {summaryItems.map((item, index) => (
              <Fragment key={item.key}>
                {index > 0 && <Line />}
                <Flex width="100%" height="fit-content" isColumn={true} gap={4} alignItems="center" flex="1">
                  <Text fontSize={20} fontWeight={600}>
                    {item.label}
                  </Text>
                  <Text fontSize={16} color={colors.gray[500]}>
                    총 {item.value}명
                  </Text>
                </Flex>
              </Fragment>
            ))}
          </AllContainer>
          <Flex isColumn={true} width="100%" height="auto">
            {QUOTA_ADMISSION_TYPES.map(admissionType => (
              <InputSection
                key={admissionType}
                onChange={handleChange(admissionType)}
                value={quotas[admissionType]}
                label={`${ADMISSION_TYPE_NAMES[admissionType]}전형`}
                placeholder={`${ADMISSION_TYPE_NAMES[admissionType]}전형`}
                suffix="명"
              />
            ))}
          </Flex>
        </>
      )}
    </Flex>
  );
};

const Line = styled.div`
  width: 1px;
  height: 60px;
  background-color: ${colors.gray[300]};
`;

const AllContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 20px 30px;
  border-radius: 12px;
  border: 1px solid ${colors.gray[300]};
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
`;
