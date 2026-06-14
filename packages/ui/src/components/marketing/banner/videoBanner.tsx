import styled from "@emotion/styled";

import { AnimationBox, MouLogoImages } from "./images";

export const VideoBanner = () => {
  return (
    <VideoBannerContainer>
      <AnimationBox rotate="left">
        {MouLogoImages.map((item, idx) => {
          if (idx < 6) {
            return <div key={idx}>{item}</div>;
          }
          return;
        })}
      </AnimationBox>
      <AnimationBox rotate="right">
        {MouLogoImages.map((item, idx) => {
          if (idx >= 6 && idx < 12) {
            return <div key={idx}>{item}</div>;
          }
          return;
        })}
      </AnimationBox>
      <AnimationBox rotate="left">
        {MouLogoImages.map((item, idx) => {
          if (idx >= 12) {
            return <div key={idx}>{item}</div>;
          }
          return;
        })}
      </AnimationBox>
    </VideoBannerContainer>
  );
};

const VideoBannerContainer = styled.div`
  overflow: hidden;
  height: auto;
`;
