export function createTemplateHandler(startSymbol: string, endSymbol: string) {
  function extract(str: string) {
    const regexPattern = `${escapeRegExp(startSymbol)}(\\w+)${escapeRegExp(
      endSymbol
    )}`;
    const regex = new RegExp(regexPattern, "g");
    const values: string[] = [];
    let match;
    while ((match = regex.exec(str)) !== null) {
      values.push(match[1]);
    }
    return values;
  }

  function fill(template: string, replacements: Record<string, string>) {
    let result = template;
    for (const key in replacements) {
      const regexPattern = `${escapeRegExp(startSymbol)}${key}${escapeRegExp(
        endSymbol
      )}`;
      const regex = new RegExp(regexPattern, "g");
      result = result.replace(regex, replacements[key]);
    }
    return result;
  }

  // Utility to escape special characters for regex
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }

  return {
    extract,
    fill,
  };
}
