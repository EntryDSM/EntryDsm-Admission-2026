import { useState } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { AuthInput } from "@entry/ui";

// 비밀번호 찾기에서의 password 변경 컴포넌트
export const ChangePassword = () => {
  const [password, setPassword] = useState<string>("");
  const [passwordCheck, setPasswordCheck] = useState<string>("");

  const isPasswordValid = password.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordError = password.length > 0 && !isPasswordValid;
  const passwordCheckError = passwordCheck.length > 0 && password !== passwordCheck;
  const isFormValid = isPasswordValid && !passwordCheckError;

  return (
    <InputsWrapper>
      <AuthInput
        type="password"
        isEye={true}
        label="비밀번호"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="변경할 비밀번호를 입력하세요"
        isError={passwordError}
        errorMsg="＊8자 이상, 숫자, 특수문자를 포함해 비밀번호를 입력해 주세요."
      />
      <AuthInput
        type="password"
        label="비밀번호 재입력"
        value={passwordCheck}
        onChange={e => setPasswordCheck(e.target.value)}
        placeholder="비밀번호를 다시 입력하세요"
        isError={passwordCheckError}
        errorMsg="비밀번호가 일치하지 않습니다."
        isEye={true}
      />
      <CheckButton $disabled={!isFormValid} disabled={!isFormValid}>
        비밀번호 변경
      </CheckButton>
    </InputsWrapper>
  );
};

const InputsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 55px;
  gap: 40px;

  @media (max-width: 1065px) {
    width: 70%;
  }
`;

const CheckButton = styled.button<{ $disabled: boolean }>`
  width: 100%;
  height: 50px;
  border-radius: 12px;
  background-color: ${colors.orange[800]};
  opacity: ${props => (props.$disabled ? "0.4" : "1")};
  color: ${colors.extra.realWhite};
  font-size: 14px;
  font-weight: 550;
  margin-top: 30px;
  transition: all 0.3s ease;
  border: none;
  cursor: ${props => (props.$disabled ? "not-allowed" : "pointer")};

  &:hover {
    background-color: ${colors.orange[850]};
  }
`;
