import { useEffect, useRef } from "react";
import styled from "@emotion/styled";

import type { ServiceHealthData, ServiceHealthStatus } from "../apis";

interface ServiceHealthModalProps {
  isOpen: boolean;
  data?: ServiceHealthData;
  error?: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  onClose: () => void;
  onRetry: () => void;
}

const normalizeStatus = (status: string): ServiceHealthStatus => {
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === "UP" || normalizedStatus === "DEGRADED" || normalizedStatus === "DOWN") {
    return normalizedStatus;
  }

  return "DOWN";
};

const formatCheckedAt = (checkedAt: string) => {
  const date = new Date(checkedAt);

  if (Number.isNaN(date.getTime())) {
    return checkedAt;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
};

export const ServiceHealthModal = ({
  isOpen,
  data,
  error,
  isLoading,
  isFetching,
  onClose,
  onRetry,
}: ServiceHealthModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    closeButtonRef.current?.focus();

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-health-title"
        aria-busy={isFetching}
        onClick={event => event.stopPropagation()}
      >
        <ModalHeader>
          <div>
            <Eyebrow>Service Health</Eyebrow>
            <ModalTitle id="service-health-title">서비스 상태</ModalTitle>
          </div>
          <CloseButton ref={closeButtonRef} type="button" onClick={onClose} aria-label="서비스 상태 닫기">
            ×
          </CloseButton>
        </ModalHeader>

        {isLoading && !data ? (
          <StateMessage role="status">서비스 상태를 확인하고 있습니다.</StateMessage>
        ) : error && !data ? (
          <StateMessage role="alert">
            <span>{error.message || "서비스 상태를 불러오지 못했습니다."}</span>
            <RetryButton type="button" onClick={onRetry}>
              다시 조회
            </RetryButton>
          </StateMessage>
        ) : data ? (
          <>
            <OverallCard $status={normalizeStatus(data.overall)}>
              <OverallInfo>
                <StatusDot $status={normalizeStatus(data.overall)} />
                <div>
                  <OverallLabel>전체 상태</OverallLabel>
                  <OverallValue>{normalizeStatus(data.overall)}</OverallValue>
                </div>
              </OverallInfo>
              <CheckedAt>
                {formatCheckedAt(data.checkedAt)}
                {isFetching && <RefreshingText> · 갱신 중</RefreshingText>}
              </CheckedAt>
            </OverallCard>

            {error && <InlineError role="alert">최신 상태를 불러오지 못해 이전 조회 결과를 표시합니다.</InlineError>}

            <ServiceList>
              {data.services.map(service => {
                const serviceStatus = normalizeStatus(service.status);

                return (
                  <ServiceCard key={service.service}>
                    <ServiceHeader>
                      <ServiceIdentity>
                        <StatusDot $status={serviceStatus} />
                        <div>
                          <ServiceLabel>{service.label}</ServiceLabel>
                          <ServiceName>{service.service}</ServiceName>
                        </div>
                      </ServiceIdentity>
                      <StatusBadge $status={serviceStatus}>{serviceStatus}</StatusBadge>
                    </ServiceHeader>

                    <ServiceMeta>
                      <span>응답 {service.responseTimeMs.toLocaleString()}ms</span>
                      <span>v{service.version}</span>
                    </ServiceMeta>

                    {service.dependencies.length > 0 && (
                      <DependencyList aria-label={`${service.label} 의존성 상태`}>
                        {service.dependencies.map(dependency => {
                          const dependencyStatus = normalizeStatus(dependency.status);

                          return (
                            <Dependency key={dependency.name} $status={dependencyStatus}>
                              {dependency.name} · {dependencyStatus}
                            </Dependency>
                          );
                        })}
                      </DependencyList>
                    )}
                  </ServiceCard>
                );
              })}
            </ServiceList>
          </>
        ) : null}
      </ModalContent>
    </ModalOverlay>
  );
};

const statusColor: Record<ServiceHealthStatus, string> = {
  UP: "#1db954",
  DEGRADED: "#f59e0b",
  DOWN: "#e84045",
};

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(17, 24, 39, 0.48);
`;

const ModalContent = styled.div`
  width: min(680px, 100%);
  max-height: min(760px, calc(100vh - 48px));
  overflow-y: auto;
  padding: 28px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.24);
`;

const ModalHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const Eyebrow = styled.p`
  margin-bottom: 4px;
  color: #6668f1;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const ModalTitle = styled.h2`
  color: #1f262c;
  font-size: 24px;
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f2f4f6;
  color: #4b5563;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
`;

const OverallCard = styled.section<{ $status: ServiceHealthStatus }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  padding: 18px 20px;
  border: 1px solid ${({ $status }) => `${statusColor[$status]}40`};
  border-radius: 14px;
  background: ${({ $status }) => `${statusColor[$status]}0d`};
`;

const OverallInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusDot = styled.span<{ $status: ServiceHealthStatus }>`
  flex: 0 0 auto;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $status }) => statusColor[$status]};
  box-shadow: 0 0 0 4px ${({ $status }) => `${statusColor[$status]}20`};
`;

const OverallLabel = styled.p`
  margin-bottom: 2px;
  color: #6d7683;
  font-size: 12px;
`;

const OverallValue = styled.strong`
  color: #1f262c;
  font-size: 18px;
`;

const CheckedAt = styled.time`
  color: #6d7683;
  font-size: 12px;
  text-align: right;
`;

const RefreshingText = styled.span`
  color: #6668f1;
`;

const ServiceList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ServiceCard = styled.article`
  padding: 18px;
  border: 1px solid #ebebeb;
  border-radius: 14px;
`;

const ServiceHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const ServiceIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ServiceLabel = styled.h3`
  color: #1f262c;
  font-size: 16px;
`;

const ServiceName = styled.p`
  margin-top: 2px;
  color: #969696;
  font-size: 11px;
`;

const StatusBadge = styled.span<{ $status: ServiceHealthStatus }>`
  padding: 5px 8px;
  border-radius: 999px;
  background: ${({ $status }) => `${statusColor[$status]}18`};
  color: ${({ $status }) => statusColor[$status]};
  font-size: 11px;
  font-weight: 700;
`;

const ServiceMeta = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  color: #6d7683;
  font-size: 12px;
`;

const DependencyList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
`;

const Dependency = styled.span<{ $status: ServiceHealthStatus }>`
  padding: 5px 8px;
  border-radius: 6px;
  background: #f7f7f7;
  color: ${({ $status }) => statusColor[$status]};
  font-size: 11px;
  font-weight: 600;
`;

const StateMessage = styled.div`
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #6d7683;
  text-align: center;
`;

const RetryButton = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  background: #6668f1;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
`;

const InlineError = styled.p`
  margin-bottom: 12px;
  color: #e84045;
  font-size: 12px;
`;
