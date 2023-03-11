import * as ReactDOM from "react-dom";

import { Options } from "./Options";
import { initLibs } from "@src/helper/libs";

initLibs().then((libs) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
    ReactDOM.render(
      <Options libs={libs} />,
      document.getElementById("options")
    );
  });
});
