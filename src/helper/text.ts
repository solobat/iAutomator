export function fillTemplate(
  template: string,
  values: { [key: string]: string }
): string {
  let result = template;

  for (const key in values) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, "g"), values[key]);
  }

  return result;
}
