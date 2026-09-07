import { useState } from "react";
import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { PrivacyPolicyModal } from "../Modal";
import { consentTitles } from "../Modal/consentTypes";
import type { ConsentType } from "../Modal/consentTypes";

export type SignupConsents = Record<ConsentType, boolean>;

export const SignupConsent = ({ onContinue }: { onContinue: (consents: SignupConsents) => void }) => {
  const [document, setDocument] = useState<ConsentType | null>(null);
  const [consents, setConsents] = useState<SignupConsents>({ terms: false, privacy: false, sensitive: false });
  const canContinue = consents.terms && consents.privacy;
  return (
    <Form
      onSubmit={event => {
        event.preventDefault();
        if (canContinue) onContinue(consents);
      }}
    >
      <ConsentBox>
        <legend>약관 및 개인정보 동의</legend>
        <label>
          <input
            type="checkbox"
            checked={Object.values(consents).every(Boolean)}
            onChange={event => {
              const agreed = event.target.checked;
              setConsents({ terms: agreed, privacy: agreed, sensitive: agreed });
            }}
          />{" "}
          전체 동의합니다 (선택 포함)
        </label>
        {(Object.keys(consentTitles) as ConsentType[]).map(type => (
          <ConsentRow key={type}>
            <label>
              <input
                type="checkbox"
                required={type !== "sensitive"}
                checked={consents[type]}
                onChange={event => setConsents(previous => ({ ...previous, [type]: event.target.checked }))}
              />
              <ConsentTag $required={type !== "sensitive"}>[{type === "sensitive" ? "선택" : "필수"}]</ConsentTag>
              {consentTitles[type]}
            </label>
            <button type="button" aria-label={`${consentTitles[type]} 전문 보기`} onClick={() => setDocument(type)}>
              보기
            </button>
          </ConsentRow>
        ))}
        <p>
          민감정보 처리에 동의하지 않으셔도 회원가입과 일반전형 지원이 가능합니다. 사회통합전형 지원 및 전형 중 편의
          제공에는 동의가 필요합니다.
        </p>
      </ConsentBox>
      <ContinueButton type="submit" disabled={!canContinue}>
        동의하고 본인인증 진행
      </ContinueButton>
      <PrivacyPolicyModal
        document={document}
        onClose={() => setDocument(null)}
        checked={document ? consents[document] : false}
        onConsentChange={(type, checked) => setConsents(previous => ({ ...previous, [type]: checked }))}
      />
    </Form>
  );
};
const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 32px;
  > p {
    font-size: 14px;
    line-height: 1.6;
    color: ${colors.gray[500]};
  }
`;
const ContinueButton = styled.button`
  width: 100%;
  align-self: center;
  height: 48px;
  border: 0;
  border-radius: 12px;
  background: ${colors.orange[800]};
  color: ${colors.extra.realWhite};
  font-size: 15px;
  font-weight: 550;
  transition: all 0.4s ease;
  cursor: pointer;
  &:hover {
    background-color: ${colors.orange[850]};
    color: ${colors.gray[100]};
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;
const ConsentBox = styled.fieldset`
  border: 1px solid ${colors.gray[300]};
  border-radius: 12px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
  }
  input {
    accent-color: ${colors.orange[800]};
    flex-shrink: 0;
  }
  p {
    font-size: 12px;
    color: ${colors.gray[500]};
    margin-top: 12px;
  }
`;
const ConsentRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 20px;
  button {
    border: 0;
    background: transparent;
    text-decoration: underline;
    cursor: pointer;
    flex-shrink: 0;
  }
`;
const ConsentTag = styled.span<{ $required: boolean }>`
  color: ${({ $required }) => ($required ? colors.orange[800] : colors.gray[500])};
  flex-shrink: 0;
`;
