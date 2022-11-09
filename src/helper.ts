import axios from "axios";

function highlightEnglish(text) {
  const params = new URLSearchParams();

  params.append("text", text);

  return axios.post("https://english.edward.io/parse", params);
}

window.addEventListener("message", function (event) {
  if (event.data.ext_from === "content") {
    const action = event.data.action;
    const data = event.data.data;

    if (action === "highlightEnglishSyntax") {
      highlightEnglish(data.text).then((resp) => {
        if (resp.data) {
          const msg: any = {
            action: "highlightEnglishSyntax",
            data: resp.data,
            callbackId: event.data.callbackId,
          };
          // https://github.com/Microsoft/TypeScript/issues/26403#issuecomment-444382398
          if (event.source instanceof Window) {
            event.source.postMessage(msg, "*", []);
          }
        }
      });
    }
  }
});
