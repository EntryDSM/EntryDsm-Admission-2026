import { colors, Flex, Text } from "@entry/design";
import { usePageData } from "@entry/ui";
import { FormElement } from "../../components";
import styled from "@emotion/styled";

export const StatementOfPurpose = () => {
  const [datas, setDatas] = usePageData("statementOfPurpose");

  const handleStudyPlanChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDatas({ ...datas, studyPlan: value });
  };

  return (
    <Flex isColumn={true} width="100%" height="fit-content">
      <Flex width="100%" height="fit-content" gap={8} isColumn>
        <NoticeDiv>
          <Text fontSize={16}>
            학업계획서는 자신의 비교과를 선택하게 된 구체적인 사유(지원 동기)와 고등학생이 된 이후 이루고자 하는 목표를
            달성하기 위한 학업계획을 상세하게 기술해주시오.
          </Text>
        </NoticeDiv>
      </Flex>
      <FormElement
        width="300px"
        type="textArea"
        label="학업계획서"
        placeholder="빈칸 포함 1,600자 이내"
        onTextAreaChange={handleStudyPlanChange}
        textAreaValue={datas.studyPlan || ""}
      />
    </Flex>
  );
};

const NoticeDiv = styled.div`
  width: 100%;
  border-radius: 12px;
  background-color: ${colors.gray[200]};
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
