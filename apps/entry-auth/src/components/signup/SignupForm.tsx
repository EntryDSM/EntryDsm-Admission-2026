import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router";
import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { AuthInput } from "@entry/ui";
import { toast } from "react-toastify";
import { IdentityApiError, signup } from "../../apis";
import type { PassInfo, SignupType } from "../../apis";
import type { SignupConsents } from "./SignupConsent";

interface SignupFormProps {
  passInfo: PassInfo;
  signupType: SignupType;
  consents: SignupConsents;
}

const isValidBirthdate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    year >= 1900 &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date <= new Date()
  );
};

const getSignupErrorMessage = (error: unknown) => {
  if (error instanceof IdentityApiError) {
    switch (error.code) {
      case "INVALID_REQUEST_BODY":
        return "회원가입 정보를 올바르게 입력해 주세요.";
      case "ACCOUNT_ALREADY_EXISTS":
        return "이미 가입된 전화번호입니다.";
      default:
        if (error.status === 400) return "회원가입 정보를 올바르게 입력해 주세요.";
        if (error.status === 409) return "이미 가입된 전화번호입니다.";
        return error.message;
    }
  }
  return "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
};

export const SignupForm = ({ passInfo, signupType, consents }: SignupFormProps) => {
  const navigate = useNavigate();
  const [birthdate, setBirthdate] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPasswordValid = password.length >= 8 && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordConfirmValid = passwordConfirm === password;
  const isBirthdateValid = isValidBirthdate(birthdate);
  const isFormValid =
    isBirthdateValid && isPasswordValid && isPasswordConfirmValid && consents.terms && consents.privacy;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await signup({
        name: passInfo.name,
        phone: passInfo.phone.replace(/\D/g, ""),
        birthdate,
        password,
        signupType,
        is_sensitive_agree: consents.sensitive,
      });
      toast.success("회원가입이 완료되었습니다. 로그인해 주세요.");
      navigate("/", { replace: true, state: { signupCompleted: true } });
    } catch (error) {
      setSubmitError(getSignupErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <AuthInput label="이름" value={passInfo.name} placeholder="" isDisabled />
      <AuthInput
        label="전화번호"
        value={passInfo.phone.replace(/^(\d{3})(\d{3,4})(\d{4})$/, "$1-$2-$3")}
        placeholder=""
        isDisabled
      />
      <AuthInput
        label="생년월일"
        value={birthdate}
        placeholder="2009-03-27"
        maxLength={10}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, 8);
          setBirthdate([digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean).join("-"));
        }}
        isError={birthdate.length > 0 && !isBirthdateValid}
        errorMsg="올바른 생년월일을 YYYY-MM-DD 형식으로 입력해 주세요."
      />
      <AuthInput
        label="비밀번호"
        type="password"
        isEye
        value={password}
        placeholder="비밀번호를 입력하세요"
        onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
        isError={password.length > 0 && !isPasswordValid}
        errorMsg="8자 이상, 숫자와 특수문자를 포함해 주세요."
      />
      <AuthInput
        label="비밀번호 확인"
        type="password"
        isEye
        value={passwordConfirm}
        placeholder="비밀번호를 다시 입력하세요"
        onChange={(event: ChangeEvent<HTMLInputElement>) => setPasswordConfirm(event.target.value)}
        isError={passwordConfirm.length > 0 && !isPasswordConfirmValid}
        errorMsg="비밀번호가 일치하지 않습니다."
      />
      {submitError && <SubmitError role="alert">{submitError}</SubmitError>}
      <SubmitButton type="submit" disabled={!isFormValid || isSubmitting}>
        {isSubmitting ? "가입 중..." : "회원가입"}
      </SubmitButton>
    </Form>
  );
};

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 32px;
`;

const SubmitError = styled.p`
  color: ${colors.extra.error};
  font-size: 13px;
  line-height: 1.5;
`;

const SubmitButton = styled.button`
  height: 48px;
  border: 0;
  border-radius: 12px;
  background: ${colors.orange[800]};
  color: ${colors.extra.realWhite};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;
