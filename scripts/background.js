const REQ_REDIRECT = "REQ_REDIRECT";
const RES_REDIRECT = "RES_REDIRECT";
const REQ_SHOW_PANNEL = "REQ_SHOW_PANNEL";
const RES_SHOW_PANNEL = "RES_SHOW_PANNEL";
const REQ_STATE_PANNEL = "REQ_STATE_PANNEL";
const RES_STATE_PANNEL = "RES_STATE_PANNEL";


const statePannel = {};

// Send response on redirect request
const onRedirectRequest = (payload, sender, sendResponse) => {
  // I'm not sure this code is neccessary
  const tabId = sender.tab.id;
  statePannel[tabId] = true;
  //
  sendResponse({ action: RES_REDIRECT, payload });
};

// Save state of pannel and response.
const onShowPannelRequest = (payload, sender, sendResponse) => {
  const tabId = sender.tab.id;
  statePannel[tabId] = payload;
  sendResponse({ action: RES_SHOW_PANNEL, payload });
};

// Send current state of pannel.
const onStatePannelRequest = (sender, sendResponse) => {
  const tabId = sender.tab.id;
  payload = !!statePannel[tabId];
  sendResponse({ action: RES_SHOW_PANNEL, payload });
};

// Event Listener on message.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { action, payload } = request;
  switch (action) {
  case REQ_REDIRECT:
    onRedirectRequest(payload, sender, sendResponse);
    break;
  case REQ_SHOW_PANNEL:
    onShowPannelRequest(payload, sender, sendResponse);
    break;
  case REQ_STATE_PANNEL:
    onStatePannelRequest(sender, sendResponse);
    break;
  default:
    console.warn(`Unknown request detected: action-${ action }${ payload ? `, payload-${ payload }` : "" }`);
    break;
  }
});
