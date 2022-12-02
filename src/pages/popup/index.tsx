import * as React from "react";
import * as ReactDOM from "react-dom";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import { checkUpdate } from "@src/server/db/database";

import Popup from "./Popup";

refreshOnUpdate("pages/popup");

checkUpdate().then(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, () => {
    ReactDOM.render(<Popup />, document.getElementById("popup"));
  });
});
