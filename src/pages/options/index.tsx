import * as ReactDOM from "react-dom";

import { Options } from "./Options";
import { initLibs } from "@src/helper/libs";
import ThemeContextProvider from "@src/context/ThemeContext";

initLibs().then((libs) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
    ReactDOM.render(
      <ThemeContextProvider>
        <Options libs={libs} />
      </ThemeContextProvider>,
      document.getElementById("options")
    );
  });
});
