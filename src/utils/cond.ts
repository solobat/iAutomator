type Condition<T> = [boolean, T];

export function cond<T>(conditions: Condition<T>[]): T | undefined {
  for (const [predicate, result] of conditions) {
    if (predicate) {
      return result;
    }
  }
  return undefined;
}
