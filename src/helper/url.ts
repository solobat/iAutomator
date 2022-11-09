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
