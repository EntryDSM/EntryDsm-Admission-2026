import { Flex } from "@entry/design";
import { InputContent, usePageData } from "@entry/ui";
import { FormElement } from "../../components";

export const GuardianInfo = () => {
  const [datas, setDatas] = usePageData("guardianInfo");

  const formDropDownData = [
    {
      data: [{ label: "", content: ["부", "모", "기타"] }],
    },
  ];

  const selectedRelationship = datas.relationship?.[0];
  const isOtherRelationship = selectedRelationship === "기타";

  const handleInputChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDatas({ [key]: e.target.value });
  };

  const handleOtherRelationshipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatas({ otherRelationship: e.target.value });
  };

  const handleDropdownChange = (values: (string | number)[]) => {
    const isOther = values[0] === "기타";

    setDatas({
      relationship: values,
      otherRelationship: isOther ? datas.otherRelationship : "",
    });
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatas({ postalCode: e.target.value });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatas({ address: e.target.value });
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatas({ addressDetail: e.target.value });
  };

  return (
    <Flex isColumn={true} width="100%" height="fit-content">
      <FormElement
        width="300px"
        type="input"
        label="보호자 성명"
        inputType="text"
        placeholder="보호자 성명을 입력해주세요."
        onInputChange={handleInputChange("guardianName")}
        value={datas.guardianName}
        readonly={false}
      />
      <FormElement
        width="300px"
        type="input"
        label="보호자 연락처"
        inputType="phone"
        placeholder="전화번호를 입력해주세요."
        onInputChange={handleInputChange("guardianNumber")}
        value={datas.guardianNumber}
        readonly={false}
      />
      <FormElement
        label="지원자와의 관계"
        type="dropDown"
        dropDownDatas={formDropDownData[0].data}
        dropDownValues={datas.relationship}
        onDropDownChange={handleDropdownChange}
        sideContent={
          isOtherRelationship ? (
            <InputContent
              width="240px"
              type="text"
              placeholder="관계를 입력해주세요."
              value={datas.otherRelationship}
              onChange={handleOtherRelationshipChange}
            />
          ) : undefined
        }
      />
      <FormElement
        label="주소"
        type="address"
        addressDetailValue={datas.addressDetail}
        addressValue={datas.address}
        postalCodeValue={datas.postalCode}
        handleAddressChange={handleAddressChange}
        handleCodeChange={handleCodeChange}
        handleDetailChange={handleDetailChange}
      />
    </Flex>
  );
};
