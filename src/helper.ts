import axios from 'axios'

function highlightEnglish(text) {
  const params = new URLSearchParams();

  params.append('text', text);

  return axios.post('https://english.edward.io/parse', params);
}

window.addEventListener('message', function(event) {
  if (event.data.ext_from === 'content') {
      const action = event.data.action;
      const data = event.data.data;

      console.log(`action: ${action}`);

      if (action === 'highlightEnglishSyntax') {
          highlightEnglish(data.text).then(resp => {
              if (resp.data) {
                  event.source.postMessage({
                      action: 'highlightEnglishSyntax',
                      data: resp.data,
                      callbackId: event.data.callbackId
                  }, '*');
              }
          })
      }
  }
});