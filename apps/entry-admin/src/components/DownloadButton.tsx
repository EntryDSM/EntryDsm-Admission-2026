import styled from "@emotion/styled";
import { colors } from "@entry/design";

import { DownloadIcon, SpinnerIcon } from "../assets";

interface IDownloadButtonType {
  label: string;
  /** 파일을 만드는 중이면 true. 버튼 폭이 바뀌지 않게 문구는 그대로 두고 아이콘과 색으로 진행 상태를 보여준다. */
  isPending?: boolean;
  onClick: () => void;
}

export const DownloadButton = ({ label, isPending = false, onClick }: IDownloadButtonType) => {
  return (
    <Container
      type="button"
      $isPending={isPending}
      aria-disabled={isPending}
      aria-label={isPending ? `${label} 생성 중` : undefined}
      onClick={onClick}
    >
      {isPending ? (
        <Spinner>
          <SpinnerIcon />
        </Spinner>
      ) : (
        <DownloadIcon />
      )}
      {label}
    </Container>
  );
};

const Container = styled.button<{ $isPending: boolean }>`
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid ${({ $isPending }) => ($isPending ? colors.green[400] : colors.gray[300])};
  border-radius: 12px;
  background-color: ${colors.extra.realWhite};
  color: ${({ $isPending }) => ($isPending ? colors.green[700] : colors.gray[500])};
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  cursor: ${({ $isPending }) => ($isPending ? "default" : "pointer")};

  &:hover {
    background-color: ${({ $isPending }) => ($isPending ? colors.extra.realWhite : colors.gray[100])};
    transition: 0.35s ease-in-out;
  }

  &:focus-visible {
    outline: 2px solid ${colors.green[500]};
    outline-offset: 3px;
  }
`;

const Spinner = styled.span`
  display: flex;
  animation: downloadButtonSpin 1s linear infinite;

  @keyframes downloadButtonSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
