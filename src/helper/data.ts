export type Stack<T> = ReturnType<typeof Stack<T>>;

export function Stack<T>() {
  let arr: Array<T> = [];

  const push = (item: T) => {
    arr.push(item);
  };

  const pop = () => {
    const item = arr.pop();

    return item;
  };

  const top = () => {
    return arr[arr.length - 1];
  };
  const empty = () => {
    arr = [];

    return arr;
  };

  const forEach = (cb: (item: T) => void) => {
    arr.forEach(cb);
  };

  return {
    push,
    pop,
    top,
    empty,
    forEach,
  };
}
