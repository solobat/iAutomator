import * as React from "react";
import * as ReactDOM from "react-dom";
import refreshOnUpdate from "virtual:reload-on-update-in-view";

import Popup from "./Popup";

refreshOnUpdate("pages/popup");

chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
  ReactDOM.render(<Popup />, document.getElementById("popup"));
});
