import { Flex } from "@entry/design";
import { usePageData } from "@entry/ui";
import { FormElement } from "../../components";

export const MiddleSchoolInfo = () => {
  const [datas, setDatas] = usePageData("middleSchoolInfo");
  // TODO: 검색 api 없어서 임시로 모달창 없이 입력창에 입력하는 형식으로 임시 대체함
  // const [selectedName, setSelectedName] = useState<string | null>(datas.schoolName || null);
  // const [selectedCode, setSelectedCode] = useState<string | null>(datas.schoolCode || null);

  const handleSchoolNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDatas({ ...datas, schoolName: value });
  };

  const handleSchoolPhoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDatas({ ...datas, schoolPhone: value });
  };

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDatas({ ...datas, studentId: value });
  };

  const handleTeacherNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDatas({ ...datas, teacherName: value });
  };

  // useEffect(() => {
  //   setDatas({ ...datas, schoolCode: selectedCode, schoolName: selectedName });
  // }, [selectedName, selectedCode]);

  return (
    <Flex isColumn={true} width="100%" height="fit-content">
      <FormElement
        type="input"
        label="중학교 이름"
        inputType="text"
        onInputChange={handleSchoolNameChange}
        value={datas.schoolName}
      />
      <FormElement
        width="300px"
        type="input"
        label="중학교 학번"
        inputType="number"
        placeholder="중학교 학번을 입력해주세요."
        onInputChange={handleStudentIdChange}
        value={datas.studentId}
        explanation="5자리 숫자 형식으로 입력해주세요. (예: 30112)"
        maxLength={5}
      />
      <FormElement
        width="300px"
        type="input"
        inputType="phone"
        label="중학교 전화번호"
        placeholder="중학교 전화번호를 입력해주세요."
        onInputChange={handleSchoolPhoneChange}
        value={datas.schoolPhone}
      />
      <FormElement
        width="300px"
        type="input"
        label="중학교 교사 성명"
        inputType="text"
        placeholder="중학교 교사 성명을 입력해주세요."
        onInputChange={handleTeacherNameChange}
        value={datas.teacherName}
      />
    </Flex>
  );
};
