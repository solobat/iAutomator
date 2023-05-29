import { ThemeContext } from "@src/context/ThemeContext";
import { Switch } from "antd";
import { useContext } from "react";

export function Settings() {
  const { mode, setMode } = useContext(ThemeContext);

  return (
    <Switch
      title="Dark Theme"
      checkedChildren="Dark"
      unCheckedChildren="Light"
      defaultChecked={mode === "dark"}
      onChange={() => {
        setMode(mode === "dark" ? "light" : "dark");
      }}
    />
  );
}
