interface ILogoType {
  isAdmin?: boolean;
  isMonitoring?: boolean;
  width?: number;
  height?: number;
  onClick?: () => void;
}

export const EntryLogo = ({ width = 26, height = 30, isAdmin = false, isMonitoring = false, onClick }: ILogoType) => {
  const colors = isMonitoring
    ? {
        outer: "#5D5FEF",
        middle: "#CFCFFF",
        inner: "#A5A6F6",
      }
    : isAdmin
      ? {
          outer: "#7FE4AD",
          middle: "#B8ECCF",
          inner: "#34D37B",
        }
      : {
          outer: "#FFBE99",
          middle: "#FFDECC",
          inner: "#FF7C33",
        };

  return (
    <svg
      onClick={onClick}
      width={width}
      height={height}
      viewBox="0 0 26 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M25.648 0H26V25.648H0C0 18.8457 2.70219 12.3221 7.51213 7.51213C12.3221 2.70219 18.8457 0 25.648 0V0Z"
        fill={colors.outer}
      />
      <path
        d="M0 0H0.352C3.72014 0 7.05531 0.663405 10.1671 1.95234C13.2788 3.24127 16.1062 5.13049 18.4879 7.51213C20.8695 9.89376 22.7587 12.7212 24.0477 15.8329C25.3366 18.9447 26 22.2799 26 25.648H0V0Z"
        fill={colors.middle}
      />
      <path d="M0 0.471001C14.2 0.471001 19.149 15.948 19.149 30L0 25.916V0.471001Z" fill={colors.inner} />
    </svg>
  );
};
