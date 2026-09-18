import { media } from "@entry/design";
import { useState, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { keyframes, css } from "@emotion/react";
import { colors } from "@entry/design";
import { school } from "../assets";
import { ArrowBottom, GrowToImg } from "../assets";
import {
  // AwardsSection,
  MouCompaniesSection,
  StatisticsSection,
  WhyChooseSection,
  GrowthTogetherSection,
  ConsultationSection,
  BannerContainer,
} from "../components";

const ments = [
  "그 누구보다 최선을 다하는 학생들,",
  "함께 개발하면서 성장하는 학교",
  "대덕 소프트웨어 마이스터고등학교",
];

export const Landing = () => {
  const [step, setStep] = useState(0);
  const [fixed, setFixed] = useState(true);
  const snapMode = useRef("");
  const maxStep = ments.length;

  const headleMove = () => {
    window.scrollTo({ top: window.innerHeight * maxStep, behavior: "smooth" });
  };

  // 스크롤을 가로채지 않고, 현재 스크롤 위치로부터 인트로 단계를 계산한다.
  // (wheel 하이재킹은 트랙패드/모바일에서 스크롤이 잠기는 문제가 있어 제거)
  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight;
      const next = Math.min(maxStep, Math.max(0, Math.round(window.scrollY / vh)));
      setStep(next);
      setFixed(window.scrollY <= vh * (maxStep + 0.3));

      // 인트로 문장 구간은 mandatory 스냅으로 한 화면씩 걸리게 하고,
      // 본문에 들어서면 proximity로 낮춰 자유 스크롤을 방해하지 않는다.
      const mode = window.scrollY < vh * maxStep ? "y mandatory" : "y proximity";
      if (snapMode.current !== mode) {
        snapMode.current = mode;
        document.documentElement.style.scrollSnapType = mode;
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      snapMode.current = "";
      document.documentElement.style.scrollSnapType = "";
    };
  }, [maxStep]);

  const isLastStep = step >= maxStep;
  const showText = step < maxStep;

  return (
    <Wrapper>
      <FixedBackground fixed={fixed} step={step} isLastStep={isLastStep}>
        <TextWrapper>
          {ments.map((text, index) => (
            <AnimatedText key={index} show={showText && step === index} fadeOut={isLastStep && step - 1 === index}>
              {text}
            </AnimatedText>
          ))}
        </TextWrapper>
        <ArrowContainer onClick={headleMove}>
          <ArrowBottom />
        </ArrowContainer>
      </FixedBackground>

      {ments.map((_, index) => (
        <SnapSection key={index} />
      ))}

      <Content fadeIn={isLastStep}>
        <MentContainer>
          <Top>우리 학교에서는</Top>
          <Middle>
            모두가 <Best>최선을</Best> 다하고 있어요.
          </Middle>
          <Description>
            <Line>학생 모두가 동아리 활동을 하며 함께 성장하고,</Line>
            <Line>자체적으로 서비스 개발과 운영을 진행하며 실무 경험을 쌓아갑니다.</Line>
          </Description>
        </MentContainer>

        <BannerContainer />

        <RightMentContainer>
          <Top>지금도 멈추지 않고</Top>
          <Middle>
            <Best>꿈</Best>을 이루어 가고 있어요.
          </Middle>
          <Description>
            <Line>대덕소프트웨어마이스터고등학교 학생들은 꾸준히 노력해 높은 취업률을 달성하고,</Line>
            <Line>여러 대회에서 입상해나가고 있습니다.</Line>
          </Description>
        </RightMentContainer>

        <StatisticsSection />

        {/* 다양한 대외 활동 */}
        {/* <AwardsSection /> */}

        {/* MOU */}
        <MouCompaniesSection />

        {/* 대마고와 함께하는 이유 */}
        <WhyChooseSection />

        {/* 성장할 수 있도록 우리가 도와드려요 */}
        <GrowthTogetherSection backgroundImage={GrowToImg} />

        {/* 학교 홈페이지 바로가기 */}
        <ConsultationSection />
      </Content>

      <ExtraSpace />
    </Wrapper>
  );
};

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const ArrowContainer = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  width: 35px;
  height: 35px;
  animation: ${bounce} 2s infinite;
  cursor: pointer;

  svg {
    width: 100%;
    height: 100%;
  }

  ${media.tablet} {
    width: 30px;
    height: 30px;
    bottom: 30px;
  }

  ${media.medium} {
    width: 25px;
    height: 25px;
    bottom: 25px;
  }
`;

const Best = styled.span`
  color: ${colors.orange[800]};
`;

const Middle = styled.div`
  font-size: 54px;
  font-weight: 700;
  margin-bottom: 32px;

  ${media.tablet} {
    font-size: 40px;
    margin-bottom: 24px;
  }

  ${media.medium} {
    font-size: clamp(25px, 7vw, 32px);
    margin-bottom: 20px;
  }
`;

const Top = styled.div`
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 15px;

  ${media.tablet} {
    font-size: 32px;
    margin-bottom: 12px;
  }

  ${media.medium} {
    font-size: clamp(20px, 6vw, 24px);
    margin-bottom: 10px;
  }
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Line = styled.div`
  font-size: 18px;
  color: #666;
  line-height: 1.1;

  overflow-wrap: anywhere;

  ${media.tablet} {
    font-size: 15px;
  }

  ${media.medium} {
    font-size: 14px;
  }
`;

const MentContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  margin: 0 100px 10px 100px;
  padding: 80px 0;

  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 1200px) {
    margin: 0 80px 5px 80px;
    padding: 60px 0;
  }

  ${media.tablet} {
    margin: 0 40px 5px 40px;
    padding: 40px 0;
  }

  ${media.medium} {
    margin: 0 20px 5px 20px;
    padding: 30px 0;
  }
`;

const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  overflow-x: hidden;
  overflow-y: visible;
  position: relative;
`;

const FixedBackground = styled.div<{
  fixed: boolean;
  step: number;
  isLastStep: boolean;
}>`
  position: ${props => (props.fixed ? "fixed" : "absolute")};
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;

  background-image:
    linear-gradient(
      rgba(0, 0, 0, ${props => 0.4 - props.step * 0.15}),
      rgba(0, 0, 0, ${props => 0.5 - props.step * 0.15})
    ),
    url(${school});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  display: flex;
  justify-content: center;
  align-items: center;

  transition:
    opacity 1.2s ease,
    background-image 1.2s ease;
  opacity: ${props => (props.isLastStep ? 0 : 1)};
  z-index: ${props => (props.isLastStep ? -1 : 1)};
`;

const TextWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 1200px;
  height: 100px;
  padding: 0 20px;

  display: flex;
  justify-content: center;
  align-items: center;

  ${media.tablet} {
    height: 80px;
    padding: 0 15px;
  }

  ${media.medium} {
    height: 60px;
    padding: 0 10px;
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const fadeOutDown = keyframes`
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(30px);
  }
`;

const AnimatedText = styled.div<{ show: boolean; fadeOut?: boolean }>`
  position: absolute;
  font-size: 64px;
  font-weight: 800;
  color: ${colors.extra.realWhite};
  text-align: center;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);

  max-width: 90%;
  line-height: 1.4;
  white-space: normal;
  word-break: keep-all;

  opacity: ${props => (props.show ? 1 : 0)};
  transform: ${props => (props.show ? "scale(1) translateY(0)" : "scale(0.95) translateY(30px)")};
  transition:
    opacity 0.9s ease,
    transform 0.9s ease;

  animation: ${props =>
    props.fadeOut
      ? css`
          ${fadeOutDown} 0.9s ease forwards
        `
      : props.show
        ? css`
            ${fadeInUp} 0.9s ease forwards
          `
        : "none"};

  z-index: ${props => (props.show ? 2 : 0)};
  pointer-events: ${props => (props.show ? "auto" : "none")};

  ${media.desktop} {
    font-size: 56px;
    max-width: 95%;
  }

  ${media.tablet} {
    font-size: 42px;
    line-height: 1.3;
    max-width: 95%;
  }

  ${media.medium} {
    font-size: 28px;
    line-height: 1.2;
    max-width: 98%;
    word-break: keep-all;
    white-space: normal;
  }

  ${media.small} {
    font-size: 24px;
    line-height: 1.1;
  }
`;

const SnapSection = styled.div`
  height: 100vh;
  width: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
`;

const fadeInContent = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Content = styled.section<{ fadeIn: boolean }>`
  background-color: white;
  color: black;
  width: 100%;
  position: relative;
  z-index: 10;
  scroll-snap-align: start;
  scroll-snap-stop: always;

  opacity: ${props => (props.fadeIn ? 1 : 0)};
  animation: ${props =>
    props.fadeIn &&
    css`
      ${fadeInContent} 1.2s ease forwards
    `};
`;

const RightMentContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: right;
  margin: 100px 100px 10px 100px;
  padding: 80px 0;

  @media (max-width: 1200px) {
    margin: 80px 80px 5px 80px;
    padding: 60px 0;
  }

  ${media.tablet} {
    margin: 50px 40px 5px 40px;
    padding: 40px 0;
    text-align: left;
  }

  ${media.medium} {
    margin: 20px 20px 5px 20px;
    padding: 30px 0;
    text-align: left;
  }
`;

const ExtraSpace = styled.div`
  height: 15vh;
  position: relative;
  z-index: 10;
`;
