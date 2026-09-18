export const breakpoints = {
  small: "360px",
  medium: "480px",
  tablet: "768px",
  desktop: "1024px",
} as const;

export const media = {
  small: `@media (max-width: ${breakpoints.small})`,
  medium: `@media (max-width: ${breakpoints.medium})`,
  tablet: `@media (max-width: ${breakpoints.tablet})`,
  desktop: `@media (max-width: ${breakpoints.desktop})`,
} as const;
