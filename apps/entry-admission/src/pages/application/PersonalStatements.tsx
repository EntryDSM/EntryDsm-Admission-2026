import { colors, Flex, Text } from "@entry/design";
import { usePageData } from "@entry/ui";
import { FormElement } from "../../components";
import styled from "@emotion/styled";

export const PersonalStatements = () => {
  const [datas, setDatas] = usePageData("personalStatements");

  const handlePersonalStmtChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDatas({ ...datas, personalStmt: value });
  };

  return (
    <Flex isColumn={true} width="100%" height="fit-content">
      <Flex width="100%" height="fit-content" gap={8} isColumn>
        <NoticeDiv>
          <Text fontSize={16}>
            자기소개서 내용은 별개의 형식은 없으며 개인의 특성 및 성장 과정, 취미와 특기, 학교 생활, 가족 안에서의 역할,
            타인보다 뛰어나다고 생각하는 자신의 강점(특성 또는 능력)과 보완 및 발전시켜온 노력 등을 자유롭게
            기술해주십시오.
          </Text>
        </NoticeDiv>
      </Flex>
      <FormElement
        width="300px"
        type="textArea"
        label="자기소개서"
        placeholder="빈칸 포함 1,600자 이내"
        onTextAreaChange={handlePersonalStmtChange}
        textAreaValue={datas.personalStmt || ""}
      />{" "}
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
