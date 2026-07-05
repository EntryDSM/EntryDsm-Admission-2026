import { colors, Flex, Text } from "@entry/design";
import styled from "@emotion/styled";
import { Btn } from "@entry/ui";

export const Submitted = () => {
  const resultDate = "2026년 00월 00일 00시 00분";

  return (
    <Flex width="100%" height="calc(100vh - 100px)" justifyContent="center" alignItems="center">
      <Flex width="40%" height="fit-content" isColumn={true} gap={60} alignItems="center">
        <Flex isColumn={true} gap={16} width="fit-content" height="fit-content" alignItems="center">
          <Text fontSize={32} fontWeight={700}>
            지원서 제출이 완료되었습니다
          </Text>
          <Text fontSize={20} color={colors.gray[400]}>
            마이페이지에서 지원 내역을 확인할 수 있습니다
          </Text>
        </Flex>
        <Flex width="100%" height="fit-content" isColumn={true} gap={16}>
          <MsgWrapper>
            <Text fontSize={16}>1차 결과는 {resultDate} 발표 예정입니다.</Text>
            <Text fontSize={16} color={colors.gray[400]}>
              최종 원서를 출력해 서명과 직은을 찍은 뒤 반드시 본교로 발송 또는 방문 접수하세요.
            </Text>
          </MsgWrapper>
        </Flex>
        <Btn width="100%">마이페이지</Btn>
      </Flex>
    </Flex>
  );
};

const MsgWrapper = styled.div`
  width: 100%;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid ${colors.gray[200]};
  background-color: ${colors.gray[50]};
  font-size: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
