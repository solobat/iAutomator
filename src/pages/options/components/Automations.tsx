import { t } from "@src/helper/i18n.helper";
import Response from "@src/server/common/response";
import * as automationsController from "@src/server/controller/automations.controller";
import { APP_ACTIONS, PAGE_ACTIONS } from "@src/common/const";
import { noticeBg } from "@src/helper/event";
import { readFileAsText, downloadJson } from "@src/helper/file.helper";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import { Delete, Download, Search, Upload } from "@mui/icons-material";
import { useMessage } from "@src/helper/message";
import { useEffect, useRef, useState } from "react";
import { IAutomation } from "@src/server/db/database";
import { RunAt as RunAtEnum } from "@src/server/enum/Automation.enum";

const EXPORT_VERSION = 1;

const RUN_AT_OPTIONS = [
  { value: RunAtEnum.START, label: t("run_at_immediately") },
  { value: RunAtEnum.END, label: t("run_at_dom_ready") },
  { value: RunAtEnum.IDLE, label: t("run_at_delayed") },
];

function toExportItem(record: IAutomation) {
  return {
    name: record.name,
    pattern: record.pattern,
    instructions: record.instructions ?? "",
    scripts: record.scripts ?? "",
    runAt: record.runAt ?? 1,
  };
}

function exportOne(record: IAutomation) {
  const name = (record.name || "automation").replace(
    /[^\w\u4e00-\u9fa5-]/g,
    "_"
  );
  downloadJson(
    { version: EXPORT_VERSION, automation: toExportItem(record) },
    `automation-${name}.json`
  );
}

function exportAll(list: IAutomation[]) {
  downloadJson(
    { version: EXPORT_VERSION, automations: list.map(toExportItem) },
    "automations.json"
  );
}

async function importFromFile(file: File): Promise<number> {
  const text = await readFileAsText(file);
  const data = JSON.parse(text);
  let items: Array<{
    name?: string;
    pattern: string;
    instructions: string;
    scripts: string;
    runAt?: number;
  }>;
  if (Array.isArray(data)) {
    items = data;
  } else if (data.automations && Array.isArray(data.automations)) {
    items = data.automations;
  } else if (data.automation && typeof data.automation === "object") {
    items = [data.automation];
  } else {
    throw new Error("Invalid format");
  }
  let count = 0;
  for (const item of items) {
    if (!item || typeof item.pattern !== "string") continue;
    await automationsController.saveAutomation(
      item.instructions ?? "",
      item.scripts ?? "",
      item.pattern,
      (item.runAt as 0 | 1 | 2) ?? 1,
      item.name
    );
    count++;
  }
  return count;
}

export function Automations() {
  const message = useMessage();
  const [list, setList] = useState<IAutomation[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onSearch = (domain: string) => {
    fetchList().then((list) =>
      setList(
        domain ? list.filter((item) => item.pattern.indexOf(domain) > -1) : list
      )
    );
  };
  const onDeleted = () => {
    fetchList().then(setList);
  };
  const onImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    importFromFile(file)
      .then((count) => {
        fetchList().then(setList);
        noticeBg({ action: PAGE_ACTIONS.REFRESH_AUTOMATIONS });
        message.success(
          chrome.i18n.getMessage("import_automations_success", [String(count)])
        );
      })
      .catch(() => {
        message.error(t("import_automations_failed"));
      });
    e.target.value = "";
  };
  useEffect(() => {
    fetchList().then(setList);
  }, []);

  return (
    <div>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        spacing={1}
        sx={{ marginBottom: 1 }}
      >
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<Download />}
            onClick={() => exportAll(list)}
            disabled={list.length === 0}
          >
            {t("export_all_automations")}
          </Button>
          <Button
            startIcon={<Upload />}
            onClick={() => fileInputRef.current?.click()}
          >
            {t("import_automations")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: "none" }}
            onChange={onImportFileChange}
          />
        </Stack>
        <TextField
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch(searchValue);
            }
          }}
          size="small"
          sx={{ width: "500px", maxWidth: "100%" }}
          placeholder="twitter.com"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "50px" }}>ID</TableCell>
              <TableCell sx={{ width: "180px" }}>{t("instructions")}</TableCell>
              <TableCell sx={{ width: "180px" }}>{t("pattern")}</TableCell>
              <TableCell sx={{ width: "50px" }}>{t("run_at")}</TableCell>
              <TableCell sx={{ width: "80px" }}>{t("operation")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.id}</TableCell>
                <TableCell
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 180,
                  }}
                >
                  {record.instructions}
                </TableCell>
                <TableCell
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 180,
                  }}
                >
                  {record.pattern}
                </TableCell>
                <TableCell>
                  <RunAt record={record} />
                </TableCell>
                <TableCell>
                  <OpBtns
                    onDeleted={onDeleted}
                    record={record}
                    exportOne={exportOne}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

function fetchList(): Promise<IAutomation[]> {
  return automationsController.getList().then((res: Response) => {
    return res.data ?? [];
  });
}

function RunAt(props: { record: IAutomation }) {
  return (
    <Select value={props.record.runAt ?? RunAtEnum.END} disabled size="small">
      {RUN_AT_OPTIONS.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  );
}

function OpBtns(props: {
  onDeleted: () => void;
  record: IAutomation;
  exportOne: (record: IAutomation) => void;
}) {
  return (
    <Box
      className="op-btns"
      sx={{ display: "flex", gap: 0.5, alignItems: "center" }}
    >
      <Tooltip title={t("export_automation")}>
        <IconButton size="small" onClick={() => props.exportOne(props.record)}>
          <Download fontSize="small" />
        </IconButton>
      </Tooltip>
      <DeleteBtn onDeleted={props.onDeleted} record={props.record} />
    </Box>
  );
}

function DeleteBtn(props: { record: IAutomation; onDeleted: () => void }) {
  const onClick = () => {
    automationsController.deleteItem(props.record.id).then(() => {
      props.onDeleted();
      noticeBg({
        action: PAGE_ACTIONS.REFRESH_AUTOMATIONS,
      });
      noticeBg({
        action: APP_ACTIONS.AUTOMATION_UPDATED,
        data: {
          type: "delete",
          old: props.record,
        },
      });
    });
  };

  return (
    <IconButton size="small" onClick={onClick}>
      <Delete fontSize="small" />
    </IconButton>
  );
}
