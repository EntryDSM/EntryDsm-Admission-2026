import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { colors } from "@entry/design";
import { AuthInput } from "@entry/ui";
import { EntryAuthTitle } from "../components/index";
// import { useUserLogin } from "../hooks/useLogin";

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const isPhoneValid = phoneNumber.replace(/[^\d]/g, "").length >= 10;
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 숫자만 추출
    const onlyNumber = value.replace(/[^\d]/g, "");

    // 000-0000-0000 포맷팅
    let formattedNumber = "";

    if (onlyNumber.length < 4) {
      formattedNumber = onlyNumber;
    } else if (onlyNumber.length < 8) {
      formattedNumber = `${onlyNumber.slice(0, 3)}-${onlyNumber.slice(3)}`;
    } else {
      formattedNumber = `${onlyNumber.slice(0, 3)}-${onlyNumber.slice(3, 7)}-${onlyNumber.slice(7, 11)}`;
    }

    setPhoneNumber(formattedNumber);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
  };

  // const loginMutation = useUserLogin();

  // const handleLogin = () => {
  // if (!isFormValid) return;

  //   loginMutation.mutate(
  //     {
  //       phoneNumber: phoneNumber.replace(/[^\d]/g, ""),
  //       password,
  //     },
  //     {
  //       onSuccess: data => {
  //         // 페이지 이동 추가
  //         navigate("/");
  //       },
  //     }
  //   );
  // };

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
      <LoginPageContainer>
        <TitleWrapper>
          <EntryAuthTitle children="EntryDSM 로그인" isAdmin={false} />
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
        <LoginButton $disabled={!isFormValid} disabled={!isFormValid}>
          로그인
        </LoginButton>
        <LoginKindContainer>
          <div style={{ cursor: "pointer" }}>회원가입</div>
          <AuthLink>비밀번호 찾기</AuthLink>
        </LoginKindContainer>
      </LoginPageContainer>
    </BackGroundWrapper>
  );
};

const BackGroundWrapper = styled.div`
  /* padding-top: 35px; */
  /* padding-bottom: 10px; */
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

const LoginPageContainer = styled.div`
  padding: 0 100px;
  border-radius: 32px;
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
  cursor: ${props => (props.$disabled ? "not-allowed" : "pointer")};
  font-size: 15px;
  font-weight: 550;
  transition: all 0.4s ease;

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

export default LoginPage;
