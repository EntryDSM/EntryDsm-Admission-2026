import { Fragment, type ChangeEvent, useCallback, useMemo, useState } from "react";
import { colors, Flex, Text } from "@entry/design";
import styled from "@emotion/styled";
import { Btn } from "@entry/ui";
import { useNavigate } from "react-router";

import type { AdmissionQuotaMap, AdmissionType } from "../apis";
import { InputSection } from "../components";
import { useAdmissionQuota, useUpdateAdmissionQuota } from "../hooks";
import { getAdmissionQuotaTotal, parseQuotaInput, QUOTA_ADMISSION_TYPES, toAdmissionQuotaMap } from "../utils";

const ADMISSION_TYPE_NAMES: Record<AdmissionType, string> = {
  GENERAL: "일반",
  MEISTER: "마이스터",
  SOCIAL: "사회통합",
};

export const AdmissionsQuota = () => {
  const navigate = useNavigate();
  const { quota, isLoading, isError, isSuccess, refetch } = useAdmissionQuota();
  const { updateAdmissionQuota, isUpdating } = useUpdateAdmissionQuota();

  // 등록된 정원이 없으면 0 으로 채운 입력칸으로 바로 등록하게 한다.
  const isRegisterMode = isSuccess && quota === null;

  // 저장 전까지는 서버 값과 분리된 편집 상태를 쓴다.
  const [quotas, setQuotas] = useState<AdmissionQuotaMap>(() => toAdmissionQuotaMap(quota));
  // 편집 중에는 재조회가 입력을 덮지 않게 동기화하지 않는다.
  const [isDirty, setIsDirty] = useState(false);
  const [syncedQuota, setSyncedQuota] = useState(quota);

  // 편집 중이 아니고 조회 결과가 바뀌었을 때만 동기화한다.
  if (!isDirty && quota !== syncedQuota) {
    setSyncedQuota(quota);
    setQuotas(toAdmissionQuotaMap(quota));
  }

  const handleChange = useCallback(
    (admissionType: AdmissionType) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = parseQuotaInput(e.target.value);
      setIsDirty(true);
      setQuotas(prev => ({ ...prev, [admissionType]: value }));
    },
    []
  );

  const total = useMemo(() => getAdmissionQuotaTotal(quotas), [quotas]);

  const summaryItems = [
    ...QUOTA_ADMISSION_TYPES.map(admissionType => ({
      key: admissionType,
      label: `${ADMISSION_TYPE_NAMES[admissionType]} 전형`,
      value: quotas[admissionType],
    })),
    { key: "total", label: "총 인원", value: total },
  ];

  // 총 인원 0 명은 실수로 보고 저장을 막는다.
  const isSaveBlocked = isLoading || isUpdating || total === 0;

  const handleSaveClick = () => {
    if (isSaveBlocked) {
      return;
    }
    // 저장이 끝나면 다시 서버 값과 동기화한다.
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
