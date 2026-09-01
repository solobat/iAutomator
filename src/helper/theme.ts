import { createTheme } from "@mui/material/styles";

// dark background used across popup/options pages
const DARK_BACKGROUND = "#141414";

export function buildTheme(mode: string) {
  const dark = mode === "dark";
  return createTheme({
    palette: {
      mode: dark ? "dark" : "light",
      ...(dark
        ? {
            background: {
              default: DARK_BACKGROUND,
              paper: DARK_BACKGROUND,
            },
          }
        : {}),
    },
  });
}
