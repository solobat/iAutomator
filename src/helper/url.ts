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
