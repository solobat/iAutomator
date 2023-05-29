import useLocalStorage from "@src/hooks/useLocalStorage";
import { createContext, ReactNode } from "react";

export const ThemeContext = createContext({
  mode: "",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setMode: (arg: string) => {},
});

// props types for provider
type ProviderProps = {
  children: ReactNode;
};

const ThemeContextProvider = ({ children }: ProviderProps) => {
  const { data, storeData } = useLocalStorage("theme", "light");

  return (
    <ThemeContext.Provider value={{ mode: data, setMode: storeData }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
