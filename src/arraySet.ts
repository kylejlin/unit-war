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
