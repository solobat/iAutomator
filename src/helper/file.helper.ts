export function convertFile2Blob(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const blob = new Blob([new Uint8Array(e.target.result as ArrayBuffer)], {
        type: file.type,
      });

      resolve(blob);
    };
    reader.onabort = function () {
      reject("onabort");
    };
    reader.onerror = function () {
      reject("onerror");
    };
    reader.readAsArrayBuffer(file);
  });
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "utf-8");
  });
}

export function downloadJson(obj: object, filename: string): void {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
