function initCuid() {
  const id = crypto.randomUUID();

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
