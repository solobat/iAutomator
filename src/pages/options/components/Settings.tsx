import { ThemeContext } from "@src/context/ThemeContext";
import {
  deleteAll,
  totalSize,
} from "@src/server/controller/records.controller";
import { Button, Switch } from "antd";
import { useContext } from "react";
import { useQuery } from "react-query";

export function Settings() {
  const { mode, setMode } = useContext(ThemeContext);
  const {
    data: cacheSize,
    isLoading,
    refetch,
  } = useQuery("cacheSize", () => {
    return totalSize().then((size) => {
      return Math.round(size / 1024);
    });
  });
  const handleCleanCache = () => {
    deleteAll().then(() => {
      refetch();
    });
  };

  return (
    <div>
      <Switch
        title="Dark Theme"
        checkedChildren="Dark"
        unCheckedChildren="Light"
        defaultChecked={mode === "dark"}
        onChange={() => {
          setMode(mode === "dark" ? "light" : "dark");
        }}
      />
      <div style={{ marginTop: "10px" }}>
        <Button
          type="primary"
          danger
          disabled={isLoading || cacheSize === 0}
          onClick={handleCleanCache}
        >
          Clear {cacheSize} Kb
        </Button>
      </div>
    </div>
  );
}
