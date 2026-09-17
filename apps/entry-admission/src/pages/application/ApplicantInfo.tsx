import React, { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Flex } from "@entry/design";
import { isEmptyValue } from "@entry/utils";
import { FormElement } from "../../components";
import { usePageData } from "@entry/ui";
import type { MyAccount } from "../../apis/account";
import { QueryKeys } from "../../apis/query";

// 계정 전화번호를 직접 입력했을 때와 같은 하이픈 형식으로 맞춥니다. (InputContent phone 타입과 동일한 규칙)
const formatAccountPhone = (phone: string) => {
  const onlyNums = phone.replace(/[^0-9]/g, "");
  if (onlyNums.startsWith("02") && onlyNums.length === 10) {
    return onlyNums.replace(/^(\d{2})(\d{4})(\d{4})$/, "$1-$2-$3");
  }
  if (onlyNums.length === 11) return onlyNums.replace(/^(\d{3})(\d{4})(\d{4})$/, "$1-$2-$3");
  if (onlyNums.length === 10) return onlyNums.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3");
  return onlyNums;
};

// "1999-02-10" 형식의 계정 생년월일을 드롭다운 값 [1999, 2, 10]으로 변환합니다.
const parseAccountBirthdate = (birthdate: string) => {
  const parts = birthdate.split("-").map(Number);
  return parts.length === 3 && parts.every(part => Number.isFinite(part) && part > 0) ? parts : null;
};

export const ApplicantInfo = () => {
  const [datas, setDatas] = usePageData("applicantInfo");
  const queryClient = useQueryClient();
  const hasPrefilledFromAccount = useRef(false);

  // RequireAuth가 내 계정 조회를 마친 뒤에만 이 페이지를 렌더링하므로 캐시에서 바로 읽습니다.
  const account = queryClient.getQueryData<MyAccount>(QueryKeys.account.me);
  // 본인(SELF) 가입 계정은 계정 정보가 곧 지원자 정보이므로 성명·연락처·생년월일을 잠그고 계정 값으로 고정합니다.
  const isSelfSignup = account?.signupType === "SELF";
  const accountBirthdate = isSelfSignup ? parseAccountBirthdate(account.birthdate ?? "") : null;

  // 잠긴 항목은 사용자가 고칠 수 없으므로, 임시저장된 값과 다르더라도 페이지 진입 시 계정 값으로 맞춥니다.
  useEffect(() => {
    if (hasPrefilledFromAccount.current || !account) {
      return;
    }

    hasPrefilledFromAccount.current = true;
    if (account.signupType !== "SELF") {
      return;
    }

    const prefill: { applicantName?: string; applicantNumber?: string; dateOfBirth?: number[] } = {};

    if (!isEmptyValue(account.name) && datas.applicantName !== account.name) {
      prefill.applicantName = account.name;
    }

    const accountPhone = formatAccountPhone(account.phone ?? "");
    if (!isEmptyValue(accountPhone) && datas.applicantNumber !== accountPhone) {
      prefill.applicantNumber = accountPhone;
    }

    const birthdate = parseAccountBirthdate(account.birthdate ?? "");
    if (birthdate && String(datas.dateOfBirth) !== String(birthdate)) {
      prefill.dateOfBirth = birthdate;
    }

    if (Object.keys(prefill).length > 0) {
      setDatas(prefill);
    }
  }, [account, datas, setDatas]);

  const years = Array.from({ length: 76 }, (_, index) => 2025 - index);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getDaysInMonth = (year: number, month: number) => {
    if (!year || !month) return [];
    const daysCount = new Date(year, month, 0).getDate();
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  };

  const stateBirthdate = (datas.dateOfBirth?.length ?? 0) > 0 ? datas.dateOfBirth : null;
  // 저장된 값이 없으면 계정 생년월일을 초기 표시값으로 넘겨, 드롭다운이 기본값(2025-1-1)을 대신 커밋하지 않게 합니다.
  const displayedBirthdate = stateBirthdate ?? accountBirthdate;

  const selectedYear = displayedBirthdate?.[0] || 2010;
  const selectedMonth = displayedBirthdate?.[1] || 1;
  const days = getDaysInMonth(selectedYear as number, selectedMonth as number);

  const formDropDownData = [
    {
      data: [
        { label: "년", content: years },
        { label: "월", content: months },
        { label: "일", content: days },
      ],
    },
  ];

  const formRadioData = [{ name: "성별", data: ["남성", "여성"] }];

  const handleInputChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDatas({ ...datas, [key]: value });
  };

  const handleDropdownChange = (values: (string | number)[]) => {
    setDatas({ ...datas, dateOfBirth: values });
  };

  const handleImgChange = async (file: File | null) => {
    if (file) {
      setDatas({ ...datas, idPhoto: file });
    }
  };

  const handleGenderSelection = (value: string) => {
    setDatas({ ...datas, gender: value });
  };

  return (
    <Flex isColumn={true} width="100%" height="fit-content" gap={16}>
      <FormElement
        type="imgSelector"
        label="증명 사진"
        onFileChange={handleImgChange}
        imgUrl={datas.idPhoto}
        isLoading={false}
        progressPercentage={0}
        explanation="＊JPG, PNG 형식의 5MB 이하 이미지만 업로드할 수 있습니다."
      />
      <FormElement
        width="300px"
        type="input"
        label="지원자 성명"
        placeholder="지원자 성명"
        inputType="text"
        onInputChange={handleInputChange("applicantName")}
        value={datas.applicantName}
        readonly={isSelfSignup}
      />
      <FormElement
        width="300px"
        type="input"
        label="지원자 연락처"
        inputType="phone"
        placeholder="지원자 연락처를 입력하세요"
        onInputChange={handleInputChange("applicantNumber")}
        value={datas.applicantNumber}
        readonly={isSelfSignup}
      />
      <FormElement
        label={formRadioData[0].name}
        type="radio"
        groupName="성별"
        radioDatas={formRadioData[0].data}
        selectedRadio={datas.gender}
        setSelectedRadio={handleGenderSelection}
      />
      <FormElement
        type="dropDown"
        label="생년월일"
        onDropDownChange={handleDropdownChange}
        dropDownDatas={formDropDownData[0].data}
        dropDownValues={displayedBirthdate ?? (datas.dateOfBirth || [2010, 1, 1])}
        disabled={isSelfSignup}
      />
    </Flex>
  );
};
