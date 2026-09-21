import { colors, Flex, Text } from "@entry/design";
import { CertCheckForm, usePageData } from "@entry/ui";

export const AttendanceVolunteer = () => {
  const [datas, setDatas] = usePageData("attendanceVolunteer");
  const [applicationClassification] = usePageData("applicationClassification");

  // const location = useLocation();

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, [location.pathname]);
  const safeData = datas || { dsmAlgorithm: null, certificate: null };
  const isGeneralAdmission = applicationClassification.typeSelection === "일반";

  const dsmAlgorithmChange = (value: "O" | "X" | null) => {
    setDatas({ ...safeData, dsmAlgorithm: value });
  };

  const certificateChange = (value: "O" | "X" | null) => {
    setDatas({ ...safeData, certificate: value });
  };

  return (
    <Flex width="100%" isColumn={true} gap={20} height="100%">
      <Text fontSize={32} fontWeight={600} color={colors.gray[500]}>
        자격증
      </Text>
      <Flex isColumn={true} width="100%" height="fit-content" gap={0} justifyContent="center">
        <CertCheckForm onChange={dsmAlgorithmChange} title="DSM 알고리즘 대회 입상" value={safeData.dsmAlgorithm} />
        {!isGeneralAdmission && (
          <CertCheckForm
            onChange={certificateChange}
            title="프로그래밍 기능사 자격증 취득"
            value={safeData.certificate}
          />
        )}
      </Flex>
    </Flex>
  );
};
