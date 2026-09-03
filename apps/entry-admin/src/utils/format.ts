/** ISO date(`2010-03-15`) → `2010.03.15`. 값이 없으면 `undefined`. */
export const formatDotDate = (isoDate?: string) => {
  if (!isoDate) {
    return undefined;
  }

  return isoDate.slice(0, 10).replaceAll("-", ".");
};
