import React, { useCallback, useMemo, useState } from "react";
import { colors, Flex, Text } from "@entry/design";
import styled from "@emotion/styled";
import {
  AddressContent,
  Check,
  DropDownContent,
  ImageContent,
  InputContent,
  PhotoUploadModal,
  RadioContent,
  TextAreaContent,
} from "@entry/ui";
import { SearchContent } from "./SearchContent";

interface BaseFormElementProps {
  label?: string;
  explanation?: string;
  warning?: string;
  width?: string;
  sideContent?: React.ReactNode;
}

interface InputProps {
  type: "input";
  value?: string | number | null;
  onInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  inputType?: "phone" | "number" | "text";
  readonly?: boolean;
  maxLength?: number;
}

interface TextAreaProps {
  type: "textArea";
  textAreaValue?: string;
  onTextAreaChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

interface RadioProps {
  type: "radio";
  radioDatas: string[];
  groupName: string;
  selectedRadio?: string;
  setSelectedRadio?: (value: string) => void;
}

interface DropDownProps {
  type: "dropDown";
  dropDownDatas: { label: string; content: (string | number)[] }[];
  dropDownValues?: (string | number)[];
  onDropDownChange?: (values: (string | number)[]) => void;
}

interface ImageProps {
  type: "imgSelector";
  imgUrl?: string | File | null;
  onFileChange?: (file: File | null) => void;
  onImageClick?: () => void;
  isLoading?: boolean;
  progressPercentage?: number;
}

interface SearchProps {
  type: "search";
  selectedName?: string | null;
  setSelectedName?: React.Dispatch<React.SetStateAction<string | null>>;
  selectedCode?: string | null;
  setSelectedCode?: React.Dispatch<React.SetStateAction<string | null>>;
}

interface AddressProps {
  type: "address";
  addressDetailValue: string;
  addressValue: string;
  postalCodeValue: string;
  handleCodeChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddressChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDetailChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

type FormElementProps = BaseFormElementProps &
  (InputProps | TextAreaProps | RadioProps | DropDownProps | ImageProps | SearchProps | AddressProps);

const MemoizedCheck = React.memo(Check);

const CheckIcon = React.memo(({ isFilled }: { isFilled: boolean }) => (
  <CheckWrapper>
    <MemoizedCheck color={isFilled ? colors.orange[800] : colors.gray[200]} />
  </CheckWrapper>
));

const DropDownSection = React.memo<{
  dropDownDatas: { label: string; content: (string | number)[] }[];
  dropDownValues?: (string | number)[];
  onDropDownChange?: (values: (string | number)[]) => void;
}>(({ dropDownDatas, dropDownValues = [], onDropDownChange }) => {
  const defaultValues = useMemo(() => dropDownDatas.map(data => data.content[0]), [dropDownDatas]);

  const currentValues = dropDownValues.length > 0 ? dropDownValues : defaultValues;

  React.useEffect(() => {
    if ((dropDownValues?.length ?? 0) === 0 && onDropDownChange) {
      onDropDownChange(defaultValues);
    }
  }, [dropDownValues, defaultValues, onDropDownChange]);

  const handleDropDownChange = useCallback(
    (index: number, value: string | number) => {
      const newValues = [...currentValues];
      newValues[index] = value;
      onDropDownChange?.(newValues);
    },
    [currentValues, onDropDownChange]
  );

  return (
    <Flex width="fit-content" height="fit-content" gap={16}>
      {dropDownDatas.map((data, index) => (
        <DropDownContent
          key={`${data.label}-${index}`}
          datas={Array.isArray(data.content) ? data.content : [data.content]}
          label={data.label}
          value={currentValues[index]}
          onChange={value => handleDropDownChange(index, value)}
        />
      ))}
    </Flex>
  );
});

export const FormElement = React.memo<FormElementProps>(props => {
  const { label, explanation, type, width, sideContent } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasValue = (() => {
    switch (type) {
      case "input":
        return props.value !== null && props.value !== undefined && props.value !== "";
      case "textArea":
        return typeof props.textAreaValue === "string" && props.textAreaValue.trim() !== "";
      case "imgSelector":
        return !!props.imgUrl;
      case "radio":
        return !!props.selectedRadio;
      case "dropDown":
        return (props.dropDownValues?.length ?? 0) > 0;
      case "search":
        return (
          props.selectedName !== null &&
          props.selectedName !== undefined &&
          props.selectedName !== "" &&
          props.selectedCode !== null &&
          props.selectedCode !== undefined &&
          props.selectedCode !== ""
        );
      case "address":
        return (
          props.addressDetailValue !== null &&
          props.addressValue !== null &&
          props.postalCodeValue !== null &&
          props.addressDetailValue !== "" &&
          props.addressValue !== "" &&
          props.postalCodeValue !== ""
        );
      default:
        return false;
    }
  })();

  const renderContent = () => {
    switch (type) {
      case "input":
        return (
          <InputContent
            width={width}
            placeholder={props.placeholder}
            value={props.value ?? ""}
            onChange={props.onInputChange}
            type={props.inputType}
            readonly={props.readonly}
            maxLength={props.maxLength}
          />
        );

      case "textArea":
        return (
          <TextAreaContent
            value={props.textAreaValue ?? ""}
            placeholder={props.placeholder}
            onChange={props.onTextAreaChange}
          />
        );

      case "radio":
        return (
          <Flex width="fit-content" height="fit-content" gap={32}>
            {props.radioDatas?.map((data, index) => (
              <RadioContent
                key={`${data}-${index}`}
                label={data}
                isSelected={props.selectedRadio === data}
                groupName={props.groupName}
                onSelect={() => {
                  if (props.selectedRadio === data) {
                    props.setSelectedRadio?.("");
                  } else {
                    props.setSelectedRadio?.(data);
                  }
                }}
              />
            ))}
          </Flex>
        );

      case "dropDown":
        return (
          <DropDownSection
            dropDownDatas={props.dropDownDatas}
            dropDownValues={props.dropDownValues}
            onDropDownChange={props.onDropDownChange}
          />
        );

      case "imgSelector": {
        const handleFileChange = (file: File | null) => {
          props.onFileChange?.(file);
        };

        return (
          <>
            <PhotoUploadModal
              isOpen={isModalOpen}
              setIsOpen={setIsModalOpen}
              onFileUpload={handleFileChange}
              initialImgUrl={props.imgUrl}
              isLoading={props.isLoading}
              progressPercentage={props.progressPercentage}
            />
            <Flex isColumn={true} gap={10} height="fit-content" width="100%" justifyContent="space-between">
              <ImageContent initialImgUrl={props.imgUrl} onClick={() => setIsModalOpen(true)} />
              {explanation && (
                <Text fontSize={16} fontWeight={300} color={colors.gray[400]}>
                  {explanation}
                </Text>
              )}
            </Flex>
          </>
        );
      }

      case "search":
        return props.setSelectedName && props.setSelectedCode ? (
          <SearchContent
            selectedName={props.selectedName}
            setSelectedName={props.setSelectedName}
            selectedCode={props.selectedCode}
            setSelectedCode={props.setSelectedCode}
          />
        ) : null;

      case "address":
        return props.handleCodeChange && props.handleAddressChange && props.handleDetailChange ? (
          <AddressContent
            postalCodeValue={props.postalCodeValue ?? ""}
            addressValue={props.addressValue ?? ""}
            addressDetailValue={props.addressDetailValue ?? ""}
            handleCodeChange={props.handleCodeChange}
            handleAddressChange={props.handleAddressChange}
            handleDetailChange={props.handleDetailChange}
          />
        ) : null;

      default:
        return null;
    }
  };

  const isBottomExplanation = type === "imgSelector";

  return (
    <FormContainer>
      <Flex gap={6} alignItems="center" height="fit-content" width="100%" justifyContent="space-between">
        <Flex
          gap={54}
          justifyContent="flex-start"
          width={type === "textArea" ? "100%" : "fit-content"}
          height="fit-content"
          alignItems={type === "textArea" ? "flex-start" : "center"}
        >
          <Flex gap={12} alignItems="center" width="fit-content" height="fit-content">
            <CheckContainer>
              <CheckIcon isFilled={hasValue} />
              <Label>{label}</Label>
            </CheckContainer>
          </Flex>

          {type === "dropDown" ? (
            <Flex gap={16} alignItems="center" width="fit-content" height="fit-content">
              {renderContent()}
              {sideContent}
            </Flex>
          ) : (
            renderContent()
          )}
        </Flex>

        {!isBottomExplanation && explanation && (
          <Text fontSize={16} fontWeight={300} color={colors.gray[400]}>
            {explanation}
          </Text>
        )}
      </Flex>
    </FormContainer>
  );
});

FormElement.displayName = "FormElement";
CheckIcon.displayName = "CheckIcon";
DropDownSection.displayName = "DropDownSection";

const Label = styled.div`
  white-space: nowrap;
  font-size: 24px;
  font-weight: 600;
`;

const CheckContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const CheckWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FormContainer = styled.div`
  width: 100%;
  padding: 32px 0;
  display: flex;
  border-bottom: 1px solid ${colors.gray[200]};
`;
