import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { Modal } from "./Modal";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  step: "privacy" | "terms";
  onReject: () => void;
  onAgree: () => void;
  isSubmitting: boolean;
}

export const PrivacyPolicyModal = ({ isOpen, step, onReject, onAgree, isSubmitting }: PrivacyPolicyModalProps) => (
  <Modal isOpen={isOpen} onClose={onReject} size="large">
    <PolicyContainer role="dialog" aria-modal="true" aria-labelledby="agreement-title">
      <Header>
        <Title id="agreement-title">{step === "privacy" ? "개인정보 처리방침" : "서비스 이용약관"}</Title>
        <EffectiveDate aria-label="시행일">
          <option>2026년 6월 19일 시행</option>
        </EffectiveDate>
      </Header>

      <PolicyContent key={step} tabIndex={0}>
        {step === "privacy" ? (
          <>
            <p>
              대덕소프트웨어마이스터고등학교(이하 “본교”)의 입학 전형 원서 접수 서비스는 지원자(이하 “정보주체”)의
              소중한 개인정보를 보호함으로써 정보주체가 안심하고 서비스를 이용할 수 있도록 「개인정보 보호법」 및
              「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령 상의 개인정보 보호규정 및 가이드라인을
              준수하고 있습니다.
            </p>
            <p>
              당사는 개인정보 처리방침을 통해 정보주체가 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며,
              개인정보 보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
              <br />※ 본 방침은 2026년 06월 19일부터 시행됩니다.
            </p>
            <section>
              <h3>1. 처리하는 개인정보의 항목</h3>
              <p>
                본교의 입학 전형 원서 접수 서비스는 입시지원을 위해 필요한 최소한의 범위로 개인정보를 수집합니다.
                정보주체가 본 서비스의 이용약관, 개인정보의 수집 및 이용, 민감정보 수집 및 이용, 개인정보 제3자 제공 및
                개인정보 처리위탁의 내용에 대해 각각 “동의” 또는 “동의 안함”을 선택할 수 있는 절차를 마련하고 있습니다.
              </p>
            </section>
            <section>
              <h3>2. 개인정보의 수집 및 이용 목적</h3>
              <p>
                수집한 개인정보는 회원 식별과 본인 확인, 입학 전형 원서 작성 및 제출, 지원자 안내와 문의 대응, 전형 결과
                제공 등 입학 전형 서비스 운영을 위해 이용합니다.
              </p>
            </section>
            <section>
              <h3>3. 개인정보의 보유 및 이용 기간</h3>
              <p>
                개인정보는 수집 및 이용 목적을 달성하거나 관련 법령에서 정한 보유 기간이 종료되면 지체 없이 파기합니다.
                단, 관계 법령에 따라 보존할 필요가 있는 경우에는 해당 기간 동안 안전하게 보관합니다.
              </p>
            </section>
          </>
        ) : (
          <>
            <p>
              본 약관은 대덕소프트웨어마이스터고등학교(이하 “본교”)가 제공하는 입학 전형 원서 접수 서비스의 이용 조건과
              절차, 본교와 이용자의 권리·의무 및 책임 사항을 규정합니다.
              <br />※ 본 약관은 2026년 06월 19일부터 시행됩니다.
            </p>
            <section>
              <h3>1. 서비스의 목적</h3>
              <p>
                본 서비스는 지원자가 회원가입, 입학 원서 작성과 제출, 전형 진행 상황 및 결과 확인 등 입학 전형에 필요한
                기능을 이용할 수 있도록 제공됩니다.
              </p>
            </section>
            <section>
              <h3>2. 이용자의 의무</h3>
              <p>
                이용자는 회원가입 및 원서 작성 시 정확한 정보를 제공해야 하며, 계정과 비밀번호를 안전하게 관리해야
                합니다. 타인의 정보를 도용하거나 서비스 운영을 방해하는 행위를 해서는 안 됩니다.
              </p>
            </section>
            <section>
              <h3>3. 서비스 이용 제한</h3>
              <p>
                본교는 이용자가 관계 법령이나 본 약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우 서비스 이용을
                제한할 수 있습니다.
              </p>
            </section>
            <section>
              <h3>4. 서비스의 변경 및 중단</h3>
              <p>
                본교는 시스템 점검, 장애 또는 불가피한 사유가 발생한 경우 서비스의 전부 또는 일부를 변경하거나 일시
                중단할 수 있으며, 가능한 경우 사전에 관련 내용을 안내합니다.
              </p>
            </section>
          </>
        )}
      </PolicyContent>

      <Footer>
        <PageNumber>{step === "privacy" ? "1/2" : "2/2"}</PageNumber>
        <ButtonGroup>
          <RejectButton type="button" onClick={onReject} disabled={isSubmitting}>
            거부
          </RejectButton>
          <AgreeButton type="button" onClick={onAgree} disabled={isSubmitting}>
            {isSubmitting ? "가입 중..." : "동의"}
          </AgreeButton>
        </ButtonGroup>
      </Footer>
    </PolicyContainer>
  </Modal>
);

const PolicyContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: min(720px, 82vh);
  padding: 48px;

  @media (max-width: 640px) {
    min-height: 80vh;
    padding: 24px 20px;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 20px;
  }
`;

const Title = styled.h2`
  color: ${colors.extra.realBlack};
  font-size: 32px;
  font-weight: 700;

  @media (max-width: 640px) {
    font-size: 24px;
  }
`;

const EffectiveDate = styled.select`
  min-width: 220px;
  padding: 12px 16px;
  border: 1px solid ${colors.gray[300]};
  border-radius: 8px;
  background: ${colors.extra.realWhite};
  color: ${colors.gray[500]};
  font: inherit;
`;

const PolicyContent = styled.div`
  flex: 1;
  min-height: 0;
  padding: 28px 32px;
  overflow-y: auto;
  border-radius: 10px;
  background: ${colors.gray[50]};
  color: ${colors.gray[500]};
  font-size: 16px;
  line-height: 1.55;

  p + p,
  section {
    margin-top: 24px;
  }

  h3 {
    margin-bottom: 14px;
    font-size: 17px;
  }

  @media (max-width: 640px) {
    padding: 20px;
    font-size: 14px;
  }
`;

const Footer = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 32px;
`;

const PageNumber = styled.span`
  color: ${colors.extra.realBlack};
  font-size: 18px;
  font-weight: 600;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const BaseButton = styled.button`
  min-width: 88px;
  padding: 12px 22px;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const RejectButton = styled(BaseButton)`
  border: 2px solid ${colors.orange[800]};
  background: ${colors.extra.realWhite};
  color: ${colors.orange[800]};
`;

const AgreeButton = styled(BaseButton)`
  border: 2px solid ${colors.orange[800]};
  background: ${colors.orange[800]};
  color: ${colors.extra.realWhite};
`;
