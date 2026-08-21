export const isEmptyValue = (value: unknown) =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim() === "") ||
  (Array.isArray(value) && value.length === 0);

export const getObjectFieldValue = (obj: unknown, field: string) =>
  obj && typeof obj === "object" ? (obj as Record<string, unknown>)[field] : undefined;

export const createRequiredFieldsValidator =
  <TData>(fields: readonly string[]) =>
  (data: TData) =>
    fields.filter(field => isEmptyValue(getObjectFieldValue(data, field)));

interface ValidateRouteDataParams<TState, TRouteToStateKey extends Record<string, keyof TState>> {
  state: TState;
  route: string;
  pageValidations: {
    [R in keyof TRouteToStateKey]?: (data: TState[TRouteToStateKey[R]]) => string[];
  };
  routeToStateKey: TRouteToStateKey;
}

export const validateRouteData = <TState, TRouteToStateKey extends Record<string, keyof TState>>({
  state,
  route,
  pageValidations,
  routeToStateKey,
}: ValidateRouteDataParams<TState, TRouteToStateKey>) => {
  const typedRoute = route as keyof TRouteToStateKey;
  const validator = pageValidations[typedRoute];
  const stateKey = routeToStateKey[typedRoute];

  if (!validator || !stateKey) {
    return { isValid: true, missingFields: [] as string[] };
  }

  const data = state[stateKey];
  const missingFields = validator(data);

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};
