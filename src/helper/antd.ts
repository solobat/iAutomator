import { DefaultOptionType } from "antd/es/select";

function defaultMapper<T>(item: T) {
  return { value: item, label: item } as DefaultOptionType;
}

export function list2options<T>(list: Array<T>, mapper = defaultMapper) {
  return list.map(mapper);
}
