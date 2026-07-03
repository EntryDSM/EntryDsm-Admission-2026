import styled from "@emotion/styled";
import { AuthCard } from "../../components";

interface ISelectUserType {
  onNext: (type: string) => void;
}

// 회원가입 1단계
export const SelectUser = ({ onNext }: ISelectUserType) => {
  const handleCardClick = (type: string) => {
    const isParent = type === "parent";
    localStorage.setItem("isParent", JSON.stringify(isParent));
    onNext(type);
  };

  return (
    <SelectUserContainer>
      <CardContainer>
        <CardWrapper
          role="button"
          tabIndex={0}
          onClick={() => handleCardClick("student")}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") handleCardClick("student");
          }}
        >
          <AuthCard isStudent={true} title="학생 명의로 인증" />
        </CardWrapper>
        <CardWrapper
          role="button"
          tabIndex={0}
          onClick={() => handleCardClick("parent")}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") handleCardClick("parent");
          }}
        >
          <AuthCard isStudent={false} title="부모 명의로 인증" />
        </CardWrapper>
      </CardContainer>
    </SelectUserContainer>
  );
};

const CardWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const SelectUserContainer = styled.div`
  width: 100%;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  margin-top: 30px;
  overflow-y: hidden;
  padding-top: 15px;
  gap: 20px;
`;
