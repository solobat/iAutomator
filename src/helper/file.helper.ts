
export function convertFile2Blob(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = function (e) {
      let blob = new Blob([new Uint8Array(e.target.result as ArrayBuffer)], { type: file.type })

      resolve(blob)
    }
    reader.onabort = function() {
      reject('onabort')
    }
    reader.onerror = function() {
      reject('onerror')
    }    
    reader.readAsArrayBuffer(file)
  })
}