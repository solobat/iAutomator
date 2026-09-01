import { ThemeContext } from "@src/context/ThemeContext";
import {
  deleteAll,
  totalSize,
} from "@src/server/controller/records.controller";
import { Button, FormControlLabel, Switch } from "@mui/material";
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
      <FormControlLabel
        control={
          <Switch
            checked={mode === "dark"}
            onChange={() => {
              setMode(mode === "dark" ? "light" : "dark");
            }}
          />
        }
        label={mode === "dark" ? "Dark" : "Light"}
        title="Dark Theme"
      />
      <div style={{ marginTop: "10px" }}>
        <Button
          variant="contained"
          color="error"
          disabled={isLoading || cacheSize === 0}
          onClick={handleCleanCache}
        >
          Clear {cacheSize} Kb
        </Button>
      </div>
    </div>
  );
}
