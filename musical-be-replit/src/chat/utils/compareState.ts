export default function compareState<T>(
  state: Record<string, T>,
  new_state: Record<string, T>,
): {
  still: string[];
  added: string[];
  deleted: string[];
} {
  const partial = Object.keys(new_state).reduce(
    (obj, k) =>
      state[k] != null
        ? { ...obj, still: [...obj.still, k] }
        : { ...obj, added: [...obj.added, k] },
    { added: [], still: [], deleted: [] },
  );

  return {
    ...partial,
    deleted: Object.keys(state).filter((x) => new_state[x] == null),
  };
}
