import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { colors } from "@entry/design";
import { AuthInput } from "@entry/ui";
import { EntryAuthTitle } from "../components/index";
import { useNavigate } from "react-router";
import { useLogin } from "../hooks/useLogin";

export const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const navigate = useNavigate();
  const { submitLogin, isPending } = useLogin();

  const normalizedPhoneNumber = phoneNumber.replace(/[^\d]/g, "");
  const isPhoneValid = /^\d{10,11}$/.test(normalizedPhoneNumber);
  const isPasswordValid = password.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isFormValid = isPhoneValid && isPasswordValid;

  // 입력을 시작하기 전(빈 값)에는 에러를 보여주지 않고, 값이 있는데 유효하지 않을 때만 표시
  const phoneError = phoneNumber.length > 0 && !isPhoneValid;
  const passwordError = password.length > 0 && !isPasswordValid;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // 768px 이하를 모바일로 판단
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || isPending) return;

    void submitLogin({ loginId: normalizedPhoneNumber, password });
  };

  if (isMobile) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f5f5f5",
          fontSize: "20px",
          color: "#333",
          textAlign: "center",
        }}
      >
        모바일에서는 접근할 수 없습니다.
      </div>
    );
  }

  return (
    <BackGroundWrapper>
      <LoginPageContainer onSubmit={handleLogin}>
        <TitleWrapper>
          <EntryAuthTitle children="EntryDSM 로그인" />
        </TitleWrapper>
        <InputWrapper>
          <AuthInput
            type="phone"
            label="전화번호"
            value={phoneNumber}
            placeholder="전화번호를 입력하세요 (010-1234-1234)"
            onChange={handlePhoneChange}
            isError={phoneError}
            errorMsg="올바른 형식이 아닙니다."
          />
          <AuthInput
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            type="password"
            value={password}
            isEye={true}
            onChange={handlePasswordChange}
            isError={passwordError}
            errorMsg="＊8자 이상, 숫자, 특수문자를 포함해 비밀번호를 입력해 주세요."
          />
        </InputWrapper>
        <LoginButton type="submit" $disabled={!isFormValid || isPending} disabled={!isFormValid || isPending}>
          {isPending ? "로그인 중..." : "로그인"}
        </LoginButton>
        <LoginKindContainer>
          <div style={{ cursor: "pointer" }} onClick={() => navigate("/signup")}>
            회원가입
          </div>
          <AuthLink onClick={() => navigate("/find-password")}>비밀번호 찾기</AuthLink>
        </LoginKindContainer>
      </LoginPageContainer>
    </BackGroundWrapper>
  );
};

const BackGroundWrapper = styled.div`
  display: flex;
  justify-content: center;
  overflow-x: hidden;
  height: calc(100vh - 70px);
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 55px;
  gap: 40px;
  width: 100%;
  min-width: 360px;
`;

const LoginPageContainer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
  margin-bottom: 30px;
`;

const TitleWrapper = styled.div`
  align-self: flex-start;
`;

const LoginButton = styled.button<{ $disabled: boolean }>`
  width: 100%;
  height: 48px;
  background-color: ${colors.orange[800]};
  opacity: ${props => (props.$disabled ? "0.4" : "1")};
  color: ${colors.extra.realWhite};
  margin-top: 20%;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 550;
  transition: all 0.4s ease;
  cursor: ${props => (props.$disabled ? "not-allowed" : "pointer")};

  &:hover {
    background-color: ${colors.orange[850]};
    color: ${colors.gray[100]};
  }
`;

const LoginKindContainer = styled.div`
  display: flex;
  align-items: center;
  color: ${colors.gray[300]};
  gap: 22px;
  margin-top: 22px;

  div:hover {
    color: ${colors.gray[400]};
    transition: all 0.3s ease-out;
  }
`;

const AuthLink = styled.div`
  width: 130px;
  display: flex;
  justify-content: center;
  border-inline-start: 2px solid ${colors.gray[100]};
  cursor: pointer;
`;
