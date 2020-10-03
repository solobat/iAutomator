import cuid from 'cuid';

const STORAGE_KEY = 'ihelpers_cuid';

function initCuid() {
  const id = cuid();

  window.localStorage.setItem(STORAGE_KEY, id);

  return id;
}

function restoreCuid() {
  const id = window.localStorage.getItem(STORAGE_KEY);

  return id
}

export function getCuid() {
  const id = restoreCuid();

  if (id) {
    return id
  } else {
    return initCuid();
  }
}