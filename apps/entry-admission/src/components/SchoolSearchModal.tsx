import styled from "@emotion/styled";
import { colors, Flex, Text } from "@entry/design";
import React, { useRef, useState } from "react";
import { Check, Search, PreviousBtn } from "@entry/ui";
import { toast } from "react-toastify";
import { useGetSchoolSearch, type SchoolSearchItem } from "../apis";

interface ISchoolSearchModalType {
  setIsShow: React.Dispatch<React.SetStateAction<boolean>>;
  isShow?: boolean;
  setSelectedName: React.Dispatch<React.SetStateAction<string | null>>;
  selectedName?: string | null;
  setSelectedCode: React.Dispatch<React.SetStateAction<string | null>>;
  selectedCode?: string | null;
}

export const SchoolSearchModal = ({
  setSelectedName,
  selectedName,
  setSelectedCode,
  selectedCode,
  setIsShow,
  isShow,
}: ISchoolSearchModalType) => {
  const [datas, setDatas] = useState<SchoolSearchItem[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [tempSelectedName, setTempSelectedName] = useState<string | null>(selectedName ?? null);
  const [tempSelectedCode, setTempSelectedCode] = useState<string | null>(selectedCode ?? null);
  const { refetch: searchSchools, isFetching } = useGetSchoolSearch(searchValue.trim());

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const contentClick = (name: string, code: string) => {
    setTempSelectedName(prev => (prev === name && tempSelectedCode === code ? null : name));
    setTempSelectedCode(prev => (prev === code ? null : code));
  };

  const handleClose = () => {
    setTempSelectedName(selectedName ?? null);
    setTempSelectedCode(selectedCode ?? null);
    setIsShow(false);
    setDatas([]);
    setSearchValue("");
  };

  const backRef = useRef<HTMLDivElement>(null);
  const backClick: React.MouseEventHandler<HTMLDivElement> = e => {
    if (backRef.current === e.target) handleClose();
  };

  const handleConfirmClick = () => {
    setSelectedName(tempSelectedName);
    setSelectedCode(tempSelectedCode);
    setIsShow(false);
    setDatas([]);
    setSearchValue("");
  };

  const handleSearchClick = async () => {
    if (searchValue.trim() === "") return;

    const result = await searchSchools();
    if (result.isError) {
      toast.error("학교 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    const schools = result.data?.schools ?? [];

    setDatas(schools.filter(school => school.name.includes(searchValue.trim())));
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSearchClick();
    }
  };

  return (
    isShow && (
      <ModalBack ref={backRef} onClick={backClick}>
        <Modal>
          <Flex isColumn={true} height="" gap={10}>
            <Text fontSize={24} fontWeight={600} color={colors.extra.realBlack}>
              학교 검색하기
            </Text>
            <Text fontSize={20} fontWeight={400} color={colors.gray[400]}>
              학교이름을 입력해 학교를 선택하세요 (검색이 되지 않는 경우, 지역명을 포함하여 검색해보세요)
            </Text>
          </Flex>
          <Wrapper>
            <FakeInput>
              <ImageContainer>
                <Search />
              </ImageContainer>
              <SearchInput
                placeholder="학교 검색"
                onChange={handleSearchChange}
                value={searchValue}
                onKeyDown={handleSearchKeyDown}
              />
            </FakeInput>
            <SearchButton onClick={() => void handleSearchClick()} disabled={isFetching}>
              {isFetching ? "검색 중" : "찾기"}
            </SearchButton>
          </Wrapper>
          <ContentContainer>
            {datas.length > 0 ? (
              datas.map(data => (
                <Content type="button" onClick={() => contentClick(data.name, data.code)} key={data.code}>
                  <SchoolInfo>
                    <Flex width="100%" height="fit-content" alignItems="center" gap={20}>
                      <Text fontWeight={600} color={colors.extra.realBlack}>
                        {data.name}
                      </Text>
                      <Text fontSize={18} color={colors.orange[800]}>
                        {data.code}
                      </Text>
                    </Flex>
                    {/* 동명 학교를 구분할 수 있도록 서버가 준 주소를 함께 보여줍니다. 주소가 없는 학교는 이름·코드만 표시합니다. */}
                    {data.address && (
                      <Text fontSize={13} fontWeight={400} color={colors.gray[400]}>
                        {data.address}
                      </Text>
                    )}
                  </SchoolInfo>
                  {tempSelectedCode === data.code || selectedCode === data.code ? (
                    <Check />
                  ) : (
                    <Check color="transparent" />
                  )}
                </Content>
              ))
            ) : (
              <Flex width="100%" height="100%" justifyContent="center" alignItems="center" gap={10}>
                <Search />
                <Text color={colors.gray[300]}>검색 결과가 없거나 API가 비활성화되어 있습니다</Text>
              </Flex>
            )}
          </ContentContainer>

          <Flex gap={16} width="100%" height="fit-content" justifyContent="flex-end">
            <PreviousBtn
              borderColor={colors.orange[800]}
              backgroundColor={colors.extra.realWhite}
              color={colors.orange[800]}
              hoverBackgroundColor={colors.extra.realWhite}
              onClick={handleClose}
            >
              취소
            </PreviousBtn>
            <PreviousBtn onClick={handleConfirmClick}>선택</PreviousBtn>
          </Flex>
        </Modal>
      </ModalBack>
    )
  );
};

const SearchButton = styled.button`
  height: 49px;
  padding: 0 24px;
  border-radius: 24px;
  background-color: ${colors.orange[800]};
  color: ${colors.extra.realWhite};
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  flex-shrink: 0;
  &:hover {
    opacity: 0.9;
  }

  &:focus-visible {
    outline: 2px solid ${colors.orange[800]};
    outline-offset: 3px;
  }
`;

const Wrapper = styled.div`
  display: flex;
  gap: 12px;
`;

const ModalBack = styled.div`
  padding: 30px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.2);
`;

const Modal = styled.div`
  width: 970px;
  height: 500px;
  border-radius: 24px;
  padding: 32px 36px;
  background-color: ${colors.extra.realWhite};
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ContentContainer = styled.div`
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
`;

const Content = styled.button`
  display: flex;
  gap: 20px;
  align-items: center;
  width: 100%;
  padding: 14px 20px;
  border: none;
  color: ${colors.gray[400]};
  font-size: 16px;
  border-bottom: 1px solid ${colors.gray[300]};
  background-color: ${colors.extra.realWhite};
  text-align: left;
  cursor: pointer;

  &:hover {
    background-color: ${colors.gray[50]};
    transition: 0.35s ease-in-out;
  }

  &:focus-visible {
    outline: none;
    background-color: ${colors.gray[50]};
    box-shadow: inset 0 0 0 2px ${colors.orange[800]};
  }
`;

// 이름·코드 줄과 주소 줄을 세로로 쌓고, 남는 너비를 차지해 체크 아이콘을 오른쪽 끝으로 밀어냅니다.
const SchoolInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const ImageContainer = styled.div`
  position: absolute;
  top: 13px;
  left: 24px;
`;

const FakeInput = styled.div`
  width: 100%;
  position: relative;
  height: 48px;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 48px;
  border-radius: 24px;
  border: 1px solid ${colors.gray[300]};
  background-color: ${colors.extra.realWhite};
  padding: 12px 24px 12px 58px;
  font-size: 16px;
  color: ${colors.extra.realBlack};

  &:focus-visible {
    outline: 2px solid ${colors.orange[800]};
    outline-offset: 2px;
  }

  &::placeholder {
    color: ${colors.gray[300]};
    font-size: 16px;
  }
`;
