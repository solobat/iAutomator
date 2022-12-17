import UrlPattern from "url-pattern";

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

export type PageType = "baike" | "wiki";
interface TypeConf {
  host: string;
  path: string;
}

export const pageTypeConf: {
  [name: string]: TypeConf;
} = {
  baike: {
    host: "https://baike.baidu.com",
    path: "/item/:0",
  },
  wiki: {
    host: "https://zh.wikipedia.org",
    path: "/wiki/:0",
  },
};

export interface OpenPageData {
  url?: string;
  type?: PageType;
  args?: {
    0?: string;
    1?: string;
    2?: string;
  };
}

export function isURLhasArgs(url: string) {
  return url.indexOf(":0") > -1;
}

export function generateURL(url: string, args: OpenPageData["args"]) {
  const match = new URL(url);
  const toPattern = new UrlPattern(match.pathname);
  const pathname = toPattern.stringify(args);

  return url.replace(match.pathname, pathname);
}

export function generateURLByType(type: PageType, args: OpenPageData["args"]) {
  const conf = pageTypeConf[type];
  const toPattern = new UrlPattern(conf.path);
  const path = toPattern.stringify(args);

  return `${conf.host}${path}`;
}

export function isParamEqual(url: string, key: string, value = "1") {
  const match = new URL(url);

  return match.searchParams.get(key) === value;
}

export function isSE(host: string) {
  const list = ["baidu.com", "google.com", "bing.com"];

  return list.some((item) => host.indexOf(item) > -1);
}

export function isFromSE(referrer: string) {
  if (referrer) {
    const url = new URL(referrer);

    return isSE(url.host);
  } else {
    return false;
  }
}

export function getURLByArgs(
  type: PageType,
  url: string,
  args: OpenPageData["args"]
) {
  let toURL;

  if (url && args) {
    if (isURLhasArgs(url)) {
      toURL = generateURL(url, args);
    } else {
      toURL = url;
    }
  }
  if (type && args) {
    toURL = generateURLByType(type, args);
  }

  return toURL;
}
