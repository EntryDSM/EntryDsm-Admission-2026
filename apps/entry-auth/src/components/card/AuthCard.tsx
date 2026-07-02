import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { SignUpIcon } from "../../assets";
import RigthArrow from "../../assets/rightArrow.svg";

interface IAuthCardType {
  isStudent: boolean;
  title: string;
}

export const AuthCard = ({ isStudent, title }: IAuthCardType) => {
  return (
    <AuthCardContainer>
      <SignUpIcon isStudent={isStudent} />
      <ContentBox>
        <TitleContainer>{title}</TitleContainer>
        <Description>EntryDSM에 {isStudent ? "학생" : "보호자"} 명의로 가입합니다.</Description>
      </ContentBox>
      <img src={RigthArrow} alt="student icon" width={15} height={15} />
    </AuthCardContainer>
  );
};

const AuthCardContainer = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  border: 1px solid ${colors.gray[300]};
  border-radius: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  transition: all 0.3s ease;
  padding: 40px 30px;

  &:hover {
    transform: translateY(-10px);
  }

  @media (max-width: 768px) {
    max-width: 100%;
    height: 380px;
  }
`;

const ContentBox = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-self: center;
  gap: 10px;
`;

const Description = styled.div`
  font-size: 14px;
  color: ${colors.gray[400]};
  line-height: 18px;

  .joinP {
    @media (max-width: 768px) {
      margin-bottom: 30px;
    }
  }
`;

const TitleContainer = styled.div`
  font-size: 18px;
  font-weight: 550;
`;
