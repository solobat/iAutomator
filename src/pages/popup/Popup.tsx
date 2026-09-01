import "./Popup.scss";

import { Alert, Box, LinearProgress, Paper, Typography } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { ThemeProvider } from "@mui/material/styles";
import * as React from "react";
import { useEffect, useMemo, useReducer } from "react";

import { t } from "@src/helper/i18n.helper";
import { MessageProvider } from "@src/helper/message";
import { buildTheme } from "@src/helper/theme";
import { BUILDIN_ACTION_FIELD_CONFIGS, PAGE_ACTIONS } from "@src/common/const";
import { ExecStepEvent } from "@src/common/types";
import { noticeBg } from "@src/helper/event";

import { TabMeta } from "../../common/types";
import { getTabs } from "../../helper/tab";
import {
  ACTIONS,
  getInitialState,
  PageContext,
  pageReducer,
  useModel,
} from "../../store/modules/popup.store";
import { AutomationsPanel } from "./components/Automation";
import { Records } from "./components/Record";
import { ShortcutsPanel } from "./components/Shortcut";
import { Help } from "./components/Help";
import ThemeContextProvider, { ThemeContext } from "@src/context/ThemeContext";

const RUNNING_STATUSES = new Set(["run_start", "step_start", "step_done"]);

function useExecListener(dispatch: React.Dispatch<any>) {
  useEffect(() => {
    noticeBg({ action: PAGE_ACTIONS.EXEC_STATE }, (resp) => {
      const data = resp?.data;
      if (data?.history?.length) {
        const latest: ExecStepEvent = data.history[data.history.length - 1];
        dispatch({ type: ACTIONS.EXEC_UPDATE, payload: latest });
      }
    });

    const listener = (msg) => {
      if (msg?.action === PAGE_ACTIONS.EXEC_STEP) {
        dispatch({ type: ACTIONS.EXEC_UPDATE, payload: msg.data });
      }
    };
    chrome.runtime.onMessage.addListener(listener);

    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [dispatch]);
}

export default function Page(props) {
  const [state, dispatch] = useReducer(pageReducer, getInitialState());

  useExecListener(dispatch);

  useEffect(() => {
    getTabs((result) => {
      dispatch({ type: ACTIONS.TAB_META, payload: result });
    });
  }, []);

  return (
    <PageContext.Provider value={{ state, dispatch }}>
      <ThemeContextProvider>
        <Popup />
      </ThemeContextProvider>
    </PageContext.Provider>
  );
}

function Popup() {
  const { state } = useModel();
  const { mode } = React.useContext(ThemeContext);
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MessageProvider>
        <div className={`popupContainer theme-${mode}`}>
          {state.tab ? <TabInfo tab={state.tab} /> : null}
        </div>
      </MessageProvider>
    </ThemeProvider>
  );
}

interface TabInfoProps {
  tab: TabMeta;
}

function ExecBanner() {
  const { state } = useModel();
  const ev = state.execEvent;

  if (!ev) {
    return null;
  }

  if (ev.status === "error") {
    return (
      <Alert severity="error" sx={{ marginBottom: 1 }}>
        {ev.automationName || t("automations")}: {ev.error}
      </Alert>
    );
  }

  if (!RUNNING_STATUSES.has(ev.status)) {
    return null;
  }

  const actionLabel =
    BUILDIN_ACTION_FIELD_CONFIGS.find((c) => c.value === ev.action)?.label ??
    ev.action;
  const progress = Math.min(
    100,
    ((ev.index + 1) / Math.max(ev.total, 1)) * 100
  );

  return (
    <Paper variant="outlined" sx={{ p: 1.5, marginBottom: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 0.5,
        }}
      >
        <Typography variant="body2" noWrap>
          {ev.automationName || t("running")}
          {ev.action ? ` · ${actionLabel} (${ev.index + 1}/${ev.total})` : ""}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {ev.index + 1}/{ev.total}
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={progress} />
    </Paper>
  );
}

function TabInfo(props: TabInfoProps) {
  const { host } = props.tab;
  const { dispatch, state } = useModel();

  return (
    <div className="tab-info">
      <ExecBanner />
      <Tabs
        value={state.tabKey}
        onChange={(_, activeKey) =>
          dispatch({ type: ACTIONS.TAB_CHANGE, payload: activeKey })
        }
      >
        <Tab label={t("automations")} value="automation" />
        <Tab label={t("records")} value="records" />
        <Tab label={t("shortcuts")} value="shortcuts" />
        <Tab label={t("help")} value="help" />
      </Tabs>
      {state.tabKey === "automation" && <AutomationsPanel />}
      {state.tabKey === "records" && <Records host={host} />}
      {state.tabKey === "shortcuts" && <ShortcutsPanel />}
      {state.tabKey === "help" && <Help />}
    </div>
  );
}
