import studentIcon from "./student.svg";
import parentIcon from "./parent.svg";

interface ISignUpIconType {
  isStudent: boolean;
}

export const SignUpIcon = ({ isStudent = true }: ISignUpIconType) => {
  if (isStudent) {
    return <img src={studentIcon} alt="student icon" width={50} height={50} />;
  }

  return <img src={parentIcon} alt="parent icon" width={50} height={40} />;
};
