function getURL(url = "") {
  if (url.startsWith("/")) {
    return new URL(location.origin + url);
  } else if (url.startsWith("http")) {
    return new URL(url);
  } else {
    return;
  }
}

export function getPath(url) {
  const u = getURL(url);

  return u?.pathname;
}

export function getHost(url) {
  const u = getURL(url);

  return u?.host;
}

export function getPathPatterns(pathname: string) {
  const pathes = pathname.split("/").filter((item) => item !== "");
  const results = pathes.reduce(
    (memo, piece) => {
      memo.list.push(memo.cur + "/*");
      memo.cur += `/${piece}`;

      return memo;
    },
    {
      list: ["/"] as string[],
      cur: "",
    }
  );

  if (pathname !== "/") {
    results.list.push(pathname);
  }

  return results.list;
}

export function getURLPatterns(hostname: string, pathname: string) {
  const pathPatterns = getPathPatterns(pathname);

  return pathPatterns.map((item) => `https?://${hostname}${item}`);
}

export type QFormat = "arr" | "default";

export function mergeQuery(
  newQuery: string,
  originQuery: string,
  qformat: QFormat = "default"
) {
  const originParams = new URLSearchParams(originQuery);

  if (qformat === "default") {
    const newParams = new URLSearchParams(newQuery);

    Array.from(newParams.entries()).forEach((pair) => {
      originParams.set(pair[0], pair[1]);
    });
  } else {
    const newParams = newQuery.split(",");
    const paramsArr = Array.from(originParams.entries());

    newParams.forEach((value, index) => {
      if (value && paramsArr[index]) {
        const key = paramsArr[index][0];

        originParams.set(key, value);
      }
    });
  }

  const newSearch = originParams.toString();

  return newSearch;
}
