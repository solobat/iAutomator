import * as ReactDOM from "react-dom";

import { Options } from "./Options";
import { initLibs } from "@src/helper/libs";
import ThemeContextProvider from "@src/context/ThemeContext";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

initLibs().then((libs) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
    ReactDOM.render(
      <QueryClientProvider client={queryClient}>
        <ThemeContextProvider>
          <Options libs={libs} />
        </ThemeContextProvider>
      </QueryClientProvider>,
      document.getElementById("options")
    );
  });
});
