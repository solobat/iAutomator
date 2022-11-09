import cuid from "cuid";

const STORAGE_KEY = "ihelpers_cuid";

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
