
export function create(title, message, url) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: url,
    title,
    message
  })
}