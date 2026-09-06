import { useMemo } from "react";
import { Flex } from "@entry/design";
import { FormElement } from "../../components";
import { usePageData } from "@entry/ui";
import { GRADUATION_TYPES, type GraduationType } from "@entry/ui";

const GENERAL_ONLY_SPECIAL_NOTES = ["국가유공자", "특례입학 대상자"] as const;
const SPECIAL_NOTE_OPTIONS = [...GENERAL_ONLY_SPECIAL_NOTES, "해당 없음"];

export const ApplicationClassification = () => {
  const [datas, setDatas] = usePageData("applicationClassification");
  const graduationType = datas?.graduationType as GraduationType | undefined;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const years = Array.from({ length: 81 }, (_, index) => 2030 - index);
  const months = Array.from({ length: 12 }, (_, index) => index + 1);

  const getDaysInMonth = (year: number, month: number) => {
    if (!year || !month) return [];
    const daysCount = new Date(year, month, 0).getDate();
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  };

  const selectedYear = datas?.graduationDate?.[0] || currentYear;
  const selectedMonth = datas?.graduationDate?.[1] || currentMonth;
  const days = getDaysInMonth(selectedYear as number, selectedMonth as number);

  const formDropDownData = useMemo(() => {
    if (GRADUATION_TYPES[2] === graduationType) {
      return [
        {
          data: [
            { label: "년", content: years },
            { label: "월", content: months },
            { label: "일", content: days },
          ],
        },
      ];
    }

    if (GRADUATION_TYPES[1] === graduationType) {
      return [
        {
          data: [
            { label: "년", content: years },
            { label: "월", content: months },
          ],
        },
      ];
    }
    return [];
  }, [graduationType, years, months, days]);

  const formRadioData = [
    { name: "유형선택", data: ["일반", "마이스터 인재", "사회통합"] },
    { name: "지역선택", data: ["대전", "전국"] },
    {
      name: "졸업구분",
      data: ["졸업 예정", "졸업", "검정고시(중학교 졸업 학력)"],
    },
  ];

  const handleTypeSelection = (value: string) => {
    if (GENERAL_ONLY_SPECIAL_NOTES.includes(datas.specialNotes as (typeof GENERAL_ONLY_SPECIAL_NOTES)[number])) {
      return;
    }

    setDatas({ ...datas, typeSelection: value });
  };

  const handleSpecialNotesSelection = (value: string) => {
    const requiresRegularAdmission = GENERAL_ONLY_SPECIAL_NOTES.includes(
      value as (typeof GENERAL_ONLY_SPECIAL_NOTES)[number]
    );

    setDatas({
      ...datas,
      specialNotes: value,
      typeSelection: requiresRegularAdmission ? "일반" : datas.typeSelection,
    });
  };

  const requiresRegularAdmission = GENERAL_ONLY_SPECIAL_NOTES.includes(
    datas.specialNotes as (typeof GENERAL_ONLY_SPECIAL_NOTES)[number]
  );

  const handleRegionSelection = (value: string) => {
    setDatas({ ...datas, regionSelection: value });
  };

  const handleGraduationTypeSelection = (value: string) => {
    let defaultDate: (string | number)[] = [];
    if (value === "졸업") defaultDate = [currentYear, 1, 1];
    if (value === "졸업 예정") defaultDate = [currentYear, 1];
    setDatas({ ...datas, graduationType: value, graduationDate: defaultDate });
  };

  const handleDropdownChange = (values: (string | number)[]) => {
    setDatas({ ...datas, graduationDate: values });
  };

  return (
    <Flex width="100%" height="fit-content" isColumn={true} gap={16}>
      <FormElement
        label="특기 사항"
        type="radio"
        groupName="특기 사항"
        radioDatas={SPECIAL_NOTE_OPTIONS}
        selectedRadio={datas?.specialNotes}
        setSelectedRadio={handleSpecialNotesSelection}
        explanation="＊국가유공자 및 특례입학 대상자는 일반 전형으로만 접수할 수 있습니다."
      />
      <FormElement
        label="전형 선택"
        type="radio"
        groupName="전형 선택"
        radioDatas={formRadioData[0].data}
        selectedRadio={datas?.typeSelection}
        setSelectedRadio={handleTypeSelection}
        disabledRadioDatas={requiresRegularAdmission ? ["마이스터 인재", "사회통합"] : []}
      />
      <FormElement
        label="지역 선택"
        type="radio"
        groupName="지역 선택"
        radioDatas={formRadioData[1].data}
        selectedRadio={datas?.regionSelection}
        setSelectedRadio={handleRegionSelection}
      />
      <FormElement
        label="졸업 구분"
        type="radio"
        groupName="졸업 구분"
        radioDatas={formRadioData[2].data}
        selectedRadio={datas?.graduationType}
        setSelectedRadio={handleGraduationTypeSelection}
      />
      {datas?.graduationType &&
        datas?.graduationType !== "검정고시(중학교 졸업 학력)" &&
        formDropDownData.length > 0 && (
          <FormElement
            label={datas?.graduationType === "졸업" ? "졸업 연월일" : "졸업 예정 연월"}
            type="dropDown"
            dropDownDatas={formDropDownData[0].data}
            dropDownValues={datas?.graduationDate || []}
            onDropDownChange={handleDropdownChange}
          />
        )}
    </Flex>
  );
};
