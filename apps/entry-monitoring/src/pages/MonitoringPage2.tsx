// import styled from "@emotion/styled";
// import { useEffect, useState } from "react";
// import { StatCard, PeopleCard, ErrorLogCard } from "../components";
// import { DeviceChartCard } from "../components";
// import BarChartCard from "../components/DashBoard";
// import { DownloadIcon } from "@entry/ui";
// import { colors } from "@entry/design";

// export const MonitoringPage = () => {
//   const labels = [
//     "00:00",
//     "1:00",
//     "2:00",
//     "3:00",
//     "4:00",
//     "5:00",
//     "6:00",
//     "7:00",
//     "8:00",
//     "9:00",
//     "10:00",
//     "11:00",
//     "12:00",
//   ];

//   const [isMobile, setIsMobile] = useState<boolean>(false);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 768); // 768px 이하를 모바일로 판단
//     };

//     handleResize();
//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   if (isMobile) {
//     return (
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           height: "100vh",
//           backgroundColor: "#f5f5f5",
//           fontSize: "20px",
//           color: "#333",
//           textAlign: "center",
//         }}
//       >
//         모바일에서는 접근할 수 없습니다.
//       </div>
//     );
//   }

//   return (
//     <BackGroundWrapper>
//       <MonitoringPageContainer>
//         <Content>
//           <DeviceChartCard
//             title="접근 기기 종류"
//             data={[
//               { label: "Android", count: 240, percentage: 80 },
//               { label: "Windows", count: 240, percentage: 80 },
//               { label: "iOS", count: 240, percentage: 80 },
//               { label: "기타", count: 240, percentage: 80 },
//             ]}
//           />

//           <LeftContainer>
//             <Container>
//               <CardContainer>
//                 <StatCard label="총 접속사 수" value="1600명" variant="primary" />
//                 <StatCard
//                   label="동시접속 기록"
//                   variant="white"
//                   detailValues={[
//                     { label: "Max", value: "160" },
//                     { label: "Avg", value: "24" },
//                   ]}
//                   labelFontSize="14px"
//                   valueFontSize="24px"
//                 />
//               </CardContainer>
//               <BarChartCard
//                 title="접속자 수"
//                 labels={labels}
//                 values={[12, 8, 6, 5, 4, 3, 14, 7, 6, 5, 10, 15, 9]}
//                 unit="명"
//               />

//               <PeopleContainer>
//                 <PeopleCard label="종합" value="0회" variant="primary" valueFontSize="20px" />
//                 <PeopleCard label="유저" value="0회" variant="gray" valueFontSize="20px" />
//                 <PeopleCard label="인증" value="0회" variant="gray" valueFontSize="20px" />
//                 <PeopleCard label="접수" value="0회" variant="gray" valueFontSize="20px" />
//               </PeopleContainer>
//               <CardContainer>
//                 <StatCard label="Client 오류" value="0회" variant="white" />
//                 <StatCard label="Client 경고" value="0회" variant="primary" />
//               </CardContainer>
//             </Container>

//             <Container>
//               <StatCard label="사용자 평균 체류시간" value="0시간 2분 2초" variant="gray" />
//               <ErrorLogCard
//                 label="최근 1시간 클라이언트 오류/경고"
//                 value="10건"
//                 items={[
//                   "Dom Client...",
//                   "Dom Client...",
//                   "Dom Client...",
//                   "Dom Client...",
//                   "Dom Client...",
//                   "Dom Client...",
//                 ]}
//               />
//             </Container>
//           </LeftContainer>
//         </Content>

//         <RightContent>
//           <Container>
//             <StatCard label="총 API 요청" value="24,304회" variant="primary" />
//             <StatCard label="API 응답 성공" value="0회" variant="white" />
//             <CardContainer>
//               <StatCard label="API 응답 실패" value="0회" variant="gray" />
//               <StatCard label="API 응답 실패율" value="0%" variant="primary" />
//             </CardContainer>
//             <ErrorLogCard
//               label="최근 1시간 서버 API 오류"
//               value="10건"
//               items={[
//                 "/api/v1/1000000/123",
//                 "/api/v1/1000000/123",
//                 "/api/v1/1000000/123",
//                 "/api/v1/1000000/123",
//                 "/api/v1/1000000/123",
//                 "/api/v1/1000000/123",
//               ]}
//             />
//           </Container>
//           <Container>
//             <BarChartCard
//               title="API 요청 수"
//               labels={labels}
//               values={[20, 6, 5, 3, 2, 1, 18, 7, 6, 5, 4, 22, 8]}
//               unit="회"
//               width={170}
//             />

//             <CardContainer>
//               <StatCard label="원서 접수 성공" value="10명" variant="gray" />
//               <StatCard label="원서 접수 실패" value="10명" variant="primary" />
//               <StatCard label="PDF 다운로드 성공" value="10명" variant="gray" />
//               <StatCard label="PDF 다운로드 실패" value="0명" variant="primary" />
//               <StatCard label="DB 총 용량" value="00MB" variant="gray" />
//               <StatCard label="버킷 총 용량" value="00MB" variant="gray" />
//             </CardContainer>
//             <PeopleContainer>
//               {/* <PeopleCard /> */}
//               <div>Hot Menu</div>
//               <button>Reload</button>
//               <button>
//                 <DownloadIcon />
//               </button>
//               <button className="gray">Status</button>
//             </PeopleContainer>
//           </Container>
//         </RightContent>
//       </MonitoringPageContainer>
//     </BackGroundWrapper>
//   );
// };

// const BackGroundWrapper = styled.div`
//   display: flex;
//   justify-content: center;
//   overflow-x: hidden;
//   height: calc(100vh - 70px);
// `;

// const MonitoringPageContainer = styled.div`
//   display: flex;
//   flex-direction: row;
//   padding: 30px;
//   gap: 25px;
//   margin-bottom: 20px;
// `;

// const Content = styled.div`
//   width: 100%;
//   display: flex;
//   flex-direction: column;
//   gap: 21px;
// `;

// const RightContent = styled.div`
//   display: flex;
//   flex-direction: row;
//   width: 100%;
//   gap: 21px;
// `;

// const CardContainer = styled.div`
//   display: grid;
//   grid-template-columns: repeat(2, 1fr);
//   gap: 20px;
//   width: 350px;
//   justify-content: center;
// `;

// const Container = styled.div`
//   display: flex;
//   flex-direction: column;
//   width: 100%;
//   gap: 26px;
// `;

// const LeftContainer = styled.div`
//   display: flex;
//   gap: 22px;
// `;

// const PeopleContainer = styled.div`
//   display: grid;
//   grid-template-columns: repeat(4, 1fr);
//   width: 350px;
//   gap: 9px;
//   border: 1px solid #cccccc;
//   border-radius: 16px;
//   padding: 14px 12px;
//   box-sizing: border-box;

//   div {
//     padding: 22px 15px;
//     display: flex;
//     align-items: center;
//     text-align: center;
//     font-weight: 700;
//   }

//   button {
//     background-color: #6668f1;
//     border-radius: 9px;
//     color: ${colors.extra.realWhite};
//     font-weight: 700;
//     font-size: 18px;
//   }

//   button.gray {
//     background-color: #969696;
//   }
// `;

// // const CardBox = styled.div`
// //   display: grid;
// //   grid-template-columns: repeat(3, 1fr);
// //   gap: 20px;
// //   width: 100%;
// //   justify-content: center;
// // `;
