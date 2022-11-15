export function highlightEnglish(text) {
  return fetch("https://english.edward.io/parse", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: `text=${text}`,
  }).then((result) => result.text());
}

export default async function hanlder(req) {
  const { data, action } = req;

  if (action === "others.highlightEnglishSyntax") {
    return highlightEnglish(data.text);
  } else {
    return Promise.resolve({});
  }
}

export function copyToClipboard(text: string) {
  document.addEventListener(
    "copy",
    (event) => {
      event.preventDefault();
      event.clipboardData.setData("text/plain", text);
    },
    { once: true }
  );

  document.execCommand("copy");
}
