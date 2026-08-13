import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { AuthInput } from "@entry/ui";
import { IdentityApiError, resetPassword } from "../../apis";
import type { PassInfo } from "../../apis";

interface ChangePasswordProps {
  passInfo: PassInfo;
}

const getPasswordResetErrorMessage = (error: unknown) => {
  if (!(error instanceof IdentityApiError)) {
    return "비밀번호 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }

  switch (error.code) {
    case "INVALID_REQUEST_BODY":
      return "입력한 정보를 다시 확인해 주세요.";
    case "PASS_INFO_NOT_FOUND":
      return "PASS 인증 정보가 없거나 만료되었습니다. 인증을 다시 진행해 주세요.";
    case "USER_NOT_FOUND":
      return "입력한 정보와 일치하는 사용자를 찾을 수 없습니다.";
    case "PASSWORD_SAME_AS_OLD":
      return "기존 비밀번호와 다른 비밀번호를 입력해 주세요.";
    default:
      if (error.status === 400) return "입력한 정보를 다시 확인해 주세요.";
      if (error.status === 404) return "PASS 인증 정보가 만료되었거나 사용자 정보가 일치하지 않습니다.";
      if (error.status === 409) return "기존 비밀번호와 다른 비밀번호를 입력해 주세요.";
      return error.message;
  }
};

export const ChangePassword = ({ passInfo }: ChangePasswordProps) => {
  const navigate = useNavigate();
  const [birthdate, setBirthdate] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isBirthdateValid = /^\d{4}-\d{2}-\d{2}$/.test(birthdate);
  const isPasswordValid = password.length >= 8 && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordError = password.length > 0 && !isPasswordValid;
  const passwordCheckError = passwordCheck.length > 0 && password !== passwordCheck;
  const isFormValid = isBirthdateValid && isPasswordValid && passwordCheck.length > 0 && password === passwordCheck;

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await resetPassword({
        loginId: passInfo.phone.replace(/\D/g, ""),
        name: passInfo.name,
        birthdate,
        newPassword: password,
      });
      toast.success("비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.");
      navigate("/", { replace: true });
    } catch (error) {
      setSubmitError(getPasswordResetErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <InputsWrapper onSubmit={handleChangePassword}>
      <AuthInput label="이름" value={passInfo.name} placeholder="" isDisabled />
      <AuthInput label="전화번호" value={passInfo.phone} placeholder="" isDisabled />
      <AuthInput
        label="생년월일"
        value={birthdate}
        placeholder="2009-03-15"
        maxLength={10}
        onChange={event => setBirthdate(event.target.value)}
        isError={birthdate.length > 0 && !isBirthdateValid}
        errorMsg="YYYY-MM-DD 형식으로 입력해 주세요."
      />
      <AuthInput
        type="password"
        isEye
        label="비밀번호"
        value={password}
        onChange={event => setPassword(event.target.value)}
        placeholder="변경할 비밀번호를 입력하세요"
        isError={passwordError}
        errorMsg="＊8자 이상, 숫자, 특수문자를 포함해 비밀번호를 입력해 주세요."
      />
      <AuthInput
        type="password"
        label="비밀번호 재입력"
        value={passwordCheck}
        onChange={event => setPasswordCheck(event.target.value)}
        placeholder="비밀번호를 다시 입력하세요"
        isError={passwordCheckError}
        errorMsg="비밀번호가 일치하지 않습니다."
        isEye
      />
      {submitError && <SubmitError role="alert">{submitError}</SubmitError>}
      <CheckButton type="submit" $disabled={!isFormValid || isSubmitting} disabled={!isFormValid || isSubmitting}>
        {isSubmitting ? "변경 중..." : "비밀번호 변경"}
      </CheckButton>
    </InputsWrapper>
  );
};

const InputsWrapper = styled.form`
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

const SubmitError = styled.p`
  width: 100%;
  color: ${colors.extra.error};
  font-size: 13px;
  line-height: 1.5;
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
