const REQ_REDIRECT = "REQ_REDIRECT";
const RES_REDIRECT = "RES_REDIRECT";
const REQ_SHOW_PANNEL = "REQ_SHOW_PANNEL";
const RES_SHOW_PANNEL = "RES_SHOW_PANNEL";
const REQ_STATE_PANNEL = "REQ_STATE_PANNEL";
const RES_STATE_PANNEL = "RES_STATE_PANNEL";


// Parent Card Properties: Styles, ID
const ParentCardStyle = {
  position: "fixed",
  top: "0",
  left: "0",
  width: "100vw",
  minHeight: "100%",
  height: "100vh",
  maxHeight: "100%",
  zIndex: "1000",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  display: "flex",
  justifyContent: "right",
  alignItems: "center"
};
const ParentCardID = "chrome-extension-parent-card";

// Child Cards Properties: Styles, ID
const ChildCardStyle = {
  backgroundColor: "rgb(54, 60, 67)",
  minWidth: "300px",
  maxWidth: "30vw",
  width: "500px",
  minHeight: "500px",
  maxHeight: "60vh",
  height: "700px",
  display: "flex",
  justifyContent: "space-evenly",
  alignItems: "center",
  borderRadius: "40px",
  flexDirection: "column",
};
const ChildCardID = "chrome-extension-child-card";

// Button Properties: Styles, Buttons & URLs
const LinkCardStyle = {
  backgroundColor: "rgb(118, 122, 128)",
  width: "90%",
  height: "100px",
  borderRadius: "20px",
  fontSize: "60px",
  color: "white"
};
const LinkProperties = {
  "Google": "https://google.com/",
  "Outlook": "https://outlook.live.com/",
  "Github": "https://github.com/"
};


let parentCard = null;

// Show or hide pannel according to visible
const showPannel = (visible=false) => {
  if (!(parentCard && parentCard.style)) return;
  parentCard.style.display = visible ? "flex" : "none";
};


// function that generate a html element with tag name, styles, and id
const generateHtmlElement = (tagName, style, id) => {
  // Create a basic element
  const element = document.createElement(tagName);
  // Apply styles
  if (typeof(style) === "object") {
    Object.keys(style).forEach(styleKey => {
      element.style[styleKey] = style[styleKey];
    });
  }
  // Apply id
  if (id) {
    element.id = id;
  }
  return element;
};

// function that process response
const onGetResponse = (res) => {
  const { action, payload } = res;
  switch (action) {
  case RES_REDIRECT:
    payload && (window.location.href = payload);
    break;
  case RES_SHOW_PANNEL:
  case RES_STATE_PANNEL:
    showPannel(payload);
    break;
  default:
    console.warn(`Unknown response detected: action-${ action }${ payload ? `, payload-${ payload }` : "" }`);
    break;
  }
};

// Send redirect request
const sendRedirectRequest = (targetURL) => {
  chrome.runtime.sendMessage({ action: REQ_REDIRECT, payload: targetURL }, onGetResponse);
};

// Send pannel visibility change request
const sendShowPannelRequest = (visible) => {
  chrome.runtime.sendMessage({ action: REQ_SHOW_PANNEL, payload: visible }, onGetResponse);
};

// Send the state of pannel visibility request
const sendStatePannelRequest = () => {
  chrome.runtime.sendMessage({ action: REQ_STATE_PANNEL }, onGetResponse);
};

// Toggle the pannel.
const togglePannel = () => {
  sendShowPannelRequest(parentCard.style.display === "none");
};


// function that generate full element to insert at the end of the document.
const generateFullElement = () => {
  // Generate the child card element.
  const childCard = generateHtmlElement("div", ChildCardStyle, ChildCardID);
  
  // Insert buttons to child card
  Object.keys(LinkProperties).forEach((btnName) => {
    // Generate the link card element.
    const linkCard = generateHtmlElement("button", LinkCardStyle);
    linkCard.innerText = btnName;
    // Add event listener
    linkCard.onclick = () => {
      const targetURL = LinkProperties[btnName];
      
      // Send redirect request to extension
      sendRedirectRequest(targetURL);

      // Redirect URL but ...
      // window.location.href = targetURL;
    };
    // Appned child to the end.
    childCard.appendChild(linkCard);
  });
  
  // Generate the parent card element.
  const fullElement = generateHtmlElement("div", ParentCardStyle, ParentCardID);
  // Add child element to the parent card
  fullElement.appendChild(childCard);

  return fullElement;
};


// function that will be called when documents is loaded.
const onload = () => {
  // Generate the element that display when Cmd + K
  parentCard = generateFullElement();
  const html = document.querySelector("html");
  html.append(parentCard);

  // Hide the parent card at first
  parentCard.style.display = "none";

  // Register keydown event for Cmd+K
  // If you use this code "document.onkeydown = (event) => ...": Replace all listeners.
  document.addEventListener("keydown", (event) => {
    if (event.code === 'KeyK' && event.ctrlKey) {
      event.preventDefault();

      // Toggle the parent card when Cmd+K
      togglePannel();
    }
  });

  // At first, confirm the visibility of the pannel.
  sendStatePannelRequest();
};

// Call onload function
onload();
