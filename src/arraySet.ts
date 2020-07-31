export function add(arr: readonly string[], item: string): readonly string[] {
  if (arr.includes(item)) {
    return arr;
  } else {
    return arr.concat([item]);
  }
}

export function remove(arr: readonly string[], removedItem: string): string[] {
  return arr.filter((item) => item !== removedItem);
}

export function isEqual(a: readonly string[], b: readonly string[]): boolean {
  return (
    a.every((aElem) => b.includes(aElem)) &&
    b.every((bElem) => a.includes(bElem))
  );
}
