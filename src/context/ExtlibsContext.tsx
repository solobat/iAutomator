import React, { FC, useContext } from "react";
import { ExtLibs } from "chrome-extension-libs";

const ExtlibsContext = React.createContext<{
  libs: ExtLibs | null;
}>({
  libs: null,
});

const ExtlibsContextProvider: FC<{
  children: React.ReactNode;
  libs: ExtLibs;
}> = ({ children, libs }) => {
  return (
    <ExtlibsContext.Provider value={{ libs }}>
      {children}
    </ExtlibsContext.Provider>
  );
};

function useExtlibsContext() {
  return useContext(ExtlibsContext);
}

export { useExtlibsContext, ExtlibsContextProvider };
