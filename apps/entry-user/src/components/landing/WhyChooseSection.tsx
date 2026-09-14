import styled from "@emotion/styled";
import { colors } from "@entry/design";
import { vid1, vid2, vid3, vid4, vid5 } from "../../assets/landing/schoolVideo/index";

export const WhyChooseSection = () => {
  const cards = [
    {
      id: 1,
      title: "[대덕소프트웨어마이스터고등학교] 학교 홍보 영상(2024)",
      date: "2024. 8. 8",
      image: vid1,
      link: "https://www.youtube.com/watch?v=mboY1J44Q1o&t=13s",
    },
    {
      id: 2,
      title: "2025학년 '대크톡' 개최: 재학생 및 졸업생 개발자 컨퍼런스",
      date: "2025. 6. 19",
      image: vid2,
      link: "https://www.youtube.com/watch?v=rjOtijlxKuY",
    },
    {
      id: 3,
      title: "[대덕소프트웨어마이스터고] 2025학년도 1,3학년 사제동행체험학습 대전오월드",
      date: "2025. 6. 12",
      image: vid3,
      link: "https://www.youtube.com/watch?v=WUwhl5vQf_g",
    },
    {
      id: 4,
      title: "[대덕소프트웨어마이스터고] 2025년 희망인재 캠프",
      date: " 2025. 7. 30",
      image: vid4,
      link: "https://www.youtube.com/watch?v=sTPfkxt2G6c&t=17s",
    },
    {
      id: 5,
      title: "(테마스페셜) 열아홉살에 프로입니다 - 대덕소프트웨어마이스터고등학교",
      date: "2025. 9. 11",
      image: vid5,
      link: "https://www.youtube.com/watch?v=ms5I_xAbpCY&t=80s",
    },
  ];

  return (
    <Container>
      <Title>대덕 SW 마이스터고와 함께 하는 이유</Title>
      <Subtitle>대덕소프트웨어마이스터고 학생들의 성장이야기예요!</Subtitle>

      <ScrollContainer>
        <CardList>
          {cards.map(card => (
            <Card key={card.id} onClick={() => window.open(card.link, "_blank", "noopener,noreferrer")}>
              <ImageWrapper>
                <CardImage src={card.image} alt={`${card.date} 동영상 썸네일`} />
              </ImageWrapper>

              <CardTitle>{card.title}</CardTitle>
              <CardSubtitle>{card.date}</CardSubtitle>
            </Card>
          ))}
        </CardList>
      </ScrollContainer>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  max-width: 1500px;
  padding: 24px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 46px;
  font-weight: bold;
  color: ${colors.gray[500]};
  margin-bottom: 32px;
  text-align: left;
  margin-top: 180px;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: ${colors.gray[400]};
  text-align: left;
  margin-bottom: 50px;

  @media (max-width: 768px) {
    font-size: 15px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const ScrollContainer = styled.div`
  position: relative;
`;

const CardList = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 35px;
  padding-top: 10px;
  padding-bottom: 16px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    height: 9px;
  }

  &::-webkit-scrollbar-track {
    background: ${colors.gray[200]};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${colors.gray[500]};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${colors.gray[400]};
  }
`;

const Card = styled.div`
  flex-shrink: 0;
  width: 400px;
  background: ${colors.orange[200]};
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  transform: translateY(0);
  cursor: pointer;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-8px);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
`;

const CardTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${colors.gray[500]};
  margin-bottom: 25px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: left;
  line-height: 1.6;
`;

const CardSubtitle = styled.p`
  color: #6b7280;
  font-size: 16px;
  text-align: left;
`;
