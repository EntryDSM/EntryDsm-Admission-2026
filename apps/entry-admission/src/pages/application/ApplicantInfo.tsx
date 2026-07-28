import React from "react";
import { Flex } from "@entry/design";
import { FormElement } from "../../components";
import { usePageData } from "@entry/ui";

export const ApplicantInfo = () => {
  const [datas, setDatas] = usePageData("applicantInfo");
  const userInfoDatas = { isParent: true };

  const years = Array.from({ length: 76 }, (_, index) => 2025 - index);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getDaysInMonth = (year: number, month: number) => {
    if (!year || !month) return [];
    const daysCount = new Date(year, month, 0).getDate();
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  };

  const selectedYear = datas?.dateOfBirth?.[0] || 2010;
  const selectedMonth = datas?.dateOfBirth?.[1] || 1;
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

  const formRadioData = [
    {
      data: ["국가유공자", "특례입학 대상자", "해당 없음"],
    },
    {
      name: "성별",
      data: ["남성", "여성"],
    },
  ];

  const handleInputChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDatas({ ...datas, [key]: value });
  };

  const handleDropdownChange = (values: (string | number)[]) => {
    setDatas({ ...datas, dateOfBirth: values });
  };

  const handleEtcChange = (value: string) => {
    setDatas({ ...datas, specialNotes: value });
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
        readonly={userInfoDatas.isParent ? false : true}
      />
      <FormElement
        width="300px"
        type="input"
        label="지원자 연락처"
        inputType="phone"
        placeholder="전화번호를 입력해주세요."
        onInputChange={handleInputChange("applicantNumber")}
        value={datas.applicantNumber}
        readonly={userInfoDatas.isParent ? false : true}
      />
      <FormElement
        label={formRadioData[1].name}
        type="radio"
        radioDatas={formRadioData[1].data}
        selectedRadio={datas.gender}
        setSelectedRadio={handleGenderSelection}
      />
      <FormElement
        type="dropDown"
        label="생년월일"
        onDropDownChange={handleDropdownChange}
        dropDownDatas={formDropDownData[0].data}
        dropDownValues={datas.dateOfBirth || [2010, 1, 1]}
      />
      <FormElement
        type="radio"
        label="특기 사항"
        radioDatas={formRadioData[0].data}
        warning="특기사항은 UI만 확인 가능하도록 남겨두었습니다."
        setSelectedRadio={handleEtcChange}
        selectedRadio={datas.specialNotes}
      />
    </Flex>
  );
};
