import axios from 'axios'
import browser from 'webextension-polyfill'

function highlightEnglish(text) {
  const params = new URLSearchParams();

  params.append('text', text);

  return axios.post('https://english.edward.io/parse', params).then(result => result.data);
}

export default async function hanlder(req) {
  const { data, action } = req

  if (action === 'others.highlightEnglishSyntax') {
    return highlightEnglish(data.text)
  } else {
    return Promise.resolve({})
  }
}

export function copyToClipboard(text: string) {
  document.addEventListener('copy', event => {
      event.preventDefault();
      event.clipboardData.setData('text/plain', text);

  }, {once: true});

  document.execCommand('copy');
}