import { Fragment, type ChangeEvent, useCallback, useMemo, useState } from "react";
import { colors, Flex, Text } from "@entry/design";
import styled from "@emotion/styled";
import { Btn } from "@entry/ui";
import { useNavigate } from "react-router";

import { InputSection } from "../components";

type DataState = {
  daejeonGeneral: number; // 대전 일반
  nationalGeneral: number; // 전국 일반
  daejeonMeister: number; // 대전 마이스터
  nationalMeister: number; // 전국 마이스터
  daejeonSocialIntegration: number; // 대전 사회통합
  nationalSocialIntegration: number; // 전국 사회 통합
};

type TotalState = {
  general: number;
  meister: number;
  socialIntegration: number;
  total: number;
};

type QuotaInputItem = {
  key: keyof DataState;
  label: string;
  placeholder: string;
};

type QuotaInputGroup = {
  key: string;
  items: QuotaInputItem[];
};

const INITIAL_DATA: DataState = {
  daejeonGeneral: 0,
  nationalGeneral: 0,
  daejeonMeister: 0,
  nationalMeister: 0,
  daejeonSocialIntegration: 0,
  nationalSocialIntegration: 0,
};

const SUMMARY_ITEMS: { key: keyof TotalState; label: string }[] = [
  { key: "general", label: "일반 전형" },
  { key: "meister", label: "마이스터 전형" },
  { key: "socialIntegration", label: "사회통합 전형" },
  { key: "total", label: "총 인원" },
];

const INPUT_GROUPS: QuotaInputGroup[] = [
  {
    key: "daejeon",
    items: [
      {
        key: "daejeonGeneral",
        label: "대전 일반전형",
        placeholder: "일반전형 (대전)",
      },
      {
        key: "daejeonMeister",
        label: "대전 마이스터전형",
        placeholder: "마이스터전형 (대전)",
      },
      {
        key: "daejeonSocialIntegration",
        label: "대전 사회통합전형",
        placeholder: "사회통합전형 (대전)",
      },
    ],
  },
  {
    key: "national",
    items: [
      {
        key: "nationalGeneral",
        label: "전국 일반전형",
        placeholder: "일반전형 (전국)",
      },
      {
        key: "nationalMeister",
        label: "전국 마이스터전형",
        placeholder: "마이스터전형 (전국)",
      },
      {
        key: "nationalSocialIntegration",
        label: "전국 사회통합전형",
        placeholder: "사회통합전형 (전국)",
      },
    ],
  },
];

export const AdmissionsQuota = () => {
  const navigate = useNavigate();
  const [datas, setDatas] = useState<DataState>(INITIAL_DATA);

  // 공통 onChange handler
  const handleChange = useCallback(
    (key: keyof DataState) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      const safeValue = Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
      setDatas(prev => ({
        ...prev,
        [key]: safeValue,
      }));
    },
    []
  );

  // datas 변경 시 totalMember 자동 계산
  const totalMember = useMemo<TotalState>(() => {
    const general = datas.daejeonGeneral + datas.nationalGeneral;
    const meister = datas.daejeonMeister + datas.nationalMeister;
    const socialIntegration = datas.daejeonSocialIntegration + datas.nationalSocialIntegration;
    const total = general + meister + socialIntegration;

    return { general, meister, socialIntegration, total };
  }, [datas]);

  const handleSaveClick = () => undefined;

  return (
    <Flex isColumn={true} width="100%" height="auto" gap={20}>
      <Flex width="100%" height="auto" alignItems="center" justifyContent="space-between">
        <Text fontSize={32} fontWeight={700}>
          정원 수정
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
      <AllContainer>
        {SUMMARY_ITEMS.map((item, index) => (
          <Fragment key={item.key}>
            {index > 0 && <Line />}
            <Flex width="100%" height="fit-content" isColumn={true} gap={4} alignItems="center" flex="1">
              <Text fontSize={20} fontWeight={600}>
                {item.label}
              </Text>
              <Text fontSize={16} color={colors.gray[500]}>
                총 {totalMember[item.key]}명
              </Text>
            </Flex>
          </Fragment>
        ))}
      </AllContainer>
      <Flex width="100%" height="auto" gap={32}>
        {INPUT_GROUPS.map(group => (
          <Flex key={group.key} isColumn={true} width="100%" height="auto">
            {group.items.map(item => (
              <InputSection
                key={item.key}
                onChange={handleChange(item.key)}
                value={datas[item.key]}
                label={item.label}
                placeholder={item.placeholder}
                suffix="명"
              />
            ))}
          </Flex>
        ))}
      </Flex>
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
