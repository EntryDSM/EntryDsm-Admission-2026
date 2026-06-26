import styled from "@emotion/styled";
import { Text } from "@entry/design";
import { EntryLogo } from "@entry/ui";

interface IEntryAuthTitleType {
  children: string;
}

export const EntryAuthTitle = ({ children }: IEntryAuthTitleType) => {
  return (
    <>
      <LogoTitle>
        <EntryLogo />
        <Text fontSize={25} fontWeight={550}>
          {children}
        </Text>
      </LogoTitle>

      <p>
        <Text fontSize={14} fontWeight={400}>
          EntryDSM에서 대덕소프트웨어마이스터고등학교 원서 접수를 시작하세요
        </Text>
      </p>
    </>
  );
};

const LogoTitle = styled.div`
  width: fit-content;
  height: 75px;
  min-height: 75px;
  gap: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 60px;
`;
