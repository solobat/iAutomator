import cuid from "cuid";

function initCuid() {
  const id = cuid();

  return id;
}

function restoreCuid() {
  return null;
}

export function getCuid() {
  const id = restoreCuid();

  if (id) {
    return id;
  } else {
    return initCuid();
  }
}
