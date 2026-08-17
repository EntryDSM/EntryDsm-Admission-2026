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

interface ValidateRouteDataParams<TState, TRoute extends string, TStateKey extends keyof TState> {
  state: TState;
  route: string;
  pageValidations: Partial<Record<TRoute, (data: any) => string[]>>;
  routeToStateKey: Record<TRoute, TStateKey>;
}

export const validateRouteData = <TState, TRoute extends string, TStateKey extends keyof TState>({
  state,
  route,
  pageValidations,
  routeToStateKey,
}: ValidateRouteDataParams<TState, TRoute, TStateKey>) => {
  const validator = pageValidations[route as TRoute];
  const stateKey = routeToStateKey[route as TRoute];

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
