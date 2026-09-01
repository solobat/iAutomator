import * as React from "react";
import { useState, useCallback } from "react";
import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import { noticeBg } from "../../../helper/event";
import {
  APP_ACTIONS,
  STORAGE_KEYS,
  SYNC_INTERVAL_OPTIONS,
  WEBDAV_MAX_SYNC_INTERVAL,
} from "@src/common/const";
import { useLocalStorageState } from "ahooks";
import { useExtlibsContext } from "@src/context/ExtlibsContext";

export default function WebDav() {
  const { libs } = useExtlibsContext();
  const [isConfiged, setConfiged] = useState(libs.Webdav.isWebDavConfiged());
  const onConfigSaved = useCallback(() => {
    setConfiged(true);
    noticeBg({
      action: APP_ACTIONS.START_SYNC,
    });
  }, []);
  const onReset = useCallback(() => {
    setConfiged(false);
    noticeBg({
      action: APP_ACTIONS.STOP_SYNC,
    });
  }, []);

  return (
    <div>
      {isConfiged ? (
        <ResetConfig onReset={onReset} />
      ) : (
        <FormConfig onSave={onConfigSaved} />
      )}
    </div>
  );
}

function ResetConfig(props: { onReset: () => void }) {
  const { libs } = useExtlibsContext();
  const [url, setURL] = useState("");
  const [syncInterval, setSyncInterval] = useLocalStorageState(
    STORAGE_KEYS.SYNC_INTERVAL,
    {
      defaultValue: WEBDAV_MAX_SYNC_INTERVAL,
    }
  );
  const [autoSync, setAutoSync] = useLocalStorageState(STORAGE_KEYS.AUTO_SYNC, {
    defaultValue: 1,
  });

  const onReset = useCallback(() => {
    libs.Webdav.removeWebDavConfig();
    setSyncInterval(WEBDAV_MAX_SYNC_INTERVAL);
    props.onReset();
  }, []);
  const onIntervalChange = useCallback((value) => {
    setSyncInterval(Number(value));
    noticeBg({
      action: APP_ACTIONS.START_SYNC,
    });
  }, []);
  const onAutoSyncChange = useCallback((value) => {
    setAutoSync(Number(value));
  }, []);

  React.useEffect(() => {
    libs.Webdav.getWebDavURL().then((res) => {
      setURL(res);
    });
  }, []);

  return (
    <Box className="webdav-form" sx={{ maxWidth: 480 }}>
      <TextField
        label="URL"
        value={url}
        size="small"
        fullWidth
        margin="dense"
        disabled
      />
      <TextField
        select
        label="Sync Interval"
        value={syncInterval}
        size="small"
        fullWidth
        margin="dense"
        onChange={(e) => onIntervalChange(e.target.value)}
      >
        {SYNC_INTERVAL_OPTIONS.map((opt, index) => {
          return (
            <MenuItem value={opt.value} key={index}>
              {opt.label}
            </MenuItem>
          );
        })}
      </TextField>
      <FormControlLabel
        control={
          <Switch
            checked={autoSync === 1}
            onChange={(e) => onAutoSyncChange(e.target.checked ? 1 : 0)}
          />
        }
        label="Auto Sync"
      />
      <Box>
        <Button variant="contained" onClick={onReset}>
          Reset
        </Button>
      </Box>
    </Box>
  );
}

function FormConfig(props: { onSave: () => void }) {
  const { libs } = useExtlibsContext();
  const [values, setValues] = useState({ url: "", username: "", password: "" });
  const setField =
    (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));
  const canSubmit = Boolean(values.url && values.username && values.password);
  const onFinish = () => {
    libs.Webdav.initClientWithConfig(values).then(() => {
      libs.Webdav.saveConfig(values);
      props.onSave();
    });
  };

  return (
    <Box className="webdav-form" sx={{ maxWidth: 480 }}>
      <TextField
        label="URL"
        required
        value={values.url}
        onChange={setField("url")}
        size="small"
        fullWidth
        margin="dense"
      />
      <TextField
        label="User Name"
        required
        value={values.username}
        onChange={setField("username")}
        size="small"
        fullWidth
        margin="dense"
      />
      <TextField
        label="Password"
        required
        type="password"
        value={values.password}
        onChange={setField("password")}
        size="small"
        fullWidth
        margin="dense"
      />
      <Box>
        <Button variant="contained" disabled={!canSubmit} onClick={onFinish}>
          Submit
        </Button>
      </Box>
    </Box>
  );
}
