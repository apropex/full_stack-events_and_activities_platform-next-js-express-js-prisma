//

export default function pickQuery<
  T extends Record<string, unknown>,
  K extends keyof T,
>(query: T | null | undefined, ...keys: K[]): Partial<Pick<T, K>> {
  const selectedQuery: Partial<Pick<T, K>> = {};

  if (!query || Object.keys(query).length <= 0) return selectedQuery;

  keys.forEach((key) => {
    if (Object.hasOwnProperty.call(query, key)) {
      selectedQuery[key] = query[key];
    }
  });

  return selectedQuery;
}
