import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Popover,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddBox,
  Delete,
  Download,
  DragIndicator,
  Edit,
  ExpandLess,
  ExpandMore,
  HelpOutline,
  KeyboardCommandKey,
  Search,
  Share,
} from "@mui/icons-material";
import * as React from "react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { t } from "@src/helper/i18n.helper";
import { useMessage } from "@src/helper/message";
import {
  InstructionAST,
  basicArgsHandler,
  parseInstructionContent,
  stringifyInstructions,
} from "@src/helper/instruction";
import { parseIscript } from "@src/helper/script";
import { downloadJson } from "@src/helper/file.helper";
import { getURLPatterns } from "@src/helper/url";
import { IAutomation } from "@src/server/db/database";
import Automation from "@src/server/model/Automation";
import "prismjs/themes/prism.css";

import {
  ActionArg,
  APP_ACTIONS,
  BUILDIN_ACTION_FIELD_CONFIGS,
  BUILTIN_ACTIONS,
  PAGE_ACTIONS,
} from "../../../common/const";
import { matchAutomations } from "../../../helper/automations";
import { noticeBg } from "../../../helper/event";
import Response from "../../../server/common/response";
import * as automationsController from "../../../server/controller/automations.controller";
import { RunAt as RunAtEnum } from "../../../server/enum/Automation.enum";
import {
  ACTIONS,
  AmFormEditing,
  PageContext,
  PageState,
  useModel,
} from "../../../store/modules/popup.store";
import { parseScript, iscript } from "@src/helper/script";
import Editor from "react-simple-code-editor";
import { Grammar, highlight } from "prismjs";
import { ExecOptions } from "@src/builtin/types";

const hightlightWithLineNumbers = (
  input: string,
  grammar: Grammar,
  language: string
) =>
  highlight(input, grammar, language)
    .split("\n")
    .map((line, i) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
    .join("\n");

const RUN_AT_OPTIONS = [
  { value: RunAtEnum.START, label: t("run_at_immediately") },
  { value: RunAtEnum.END, label: t("run_at_dom_ready") },
  { value: RunAtEnum.IDLE, label: t("run_at_delayed") },
];

const RUNNING_STATUSES = new Set(["run_start", "step_start", "step_done"]);

export function AutomationsPanel() {
  const { state } = useContext(PageContext);
  const { amFormEditing } = state;

  return (
    <div>
      {amFormEditing === AmFormEditing.Instruction && <AutomationEditor />}
      {amFormEditing === AmFormEditing.Script && <ScriptsEditor />}
      {amFormEditing === AmFormEditing.False && <Buttons />}
      <Automations />
    </div>
  );
}

function QuickAddContent(props: {
  state: PageState;
  dispatch: React.Dispatch<any>;
  onClose: () => void;
}) {
  const { state, dispatch, onClose } = props;
  const host = state.tab?.host || "";
  const defaultPattern = host ? `https://${host}/*` : "";
  const [actionValue, setActionValue] = useState<string>("");
  const [pattern, setPattern] = useState(defaultPattern);

  const cfg = BUILDIN_ACTION_FIELD_CONFIGS.find((c) => c.value === actionValue);

  const onCreate = () => {
    if (!cfg) return;
    const defaultArgs: Record<string, unknown> = {};
    cfg.args?.forEach((a) => {
      defaultArgs[a.name] =
        a.defaultValue !== undefined ? a.defaultValue : a.value;
    });
    const rawArgs = basicArgsHandler.stringify(
      defaultArgs as import("@src/builtin/types").ExecOptions,
      cfg.value
    );
    const row = {
      action: cfg.value,
      rawArgs,
      scope: "body",
    };
    dispatch({
      type: ACTIONS.AUTOMATION_FORM_UPDATE,
      payload: {
        pattern: pattern || defaultPattern,
        name: `${cfg.label} - ${host || "site"}`,
        runAt: RunAtEnum.END,
        data: [row],
      },
      editingMode: AmFormEditing.Instruction,
    });
    onClose();
  };

  return (
    <Box className="am-quick-add-content" sx={{ width: 280 }}>
      <Box sx={{ marginBottom: 1 }}>
        <Typography
          variant="caption"
          display="block"
          sx={{ marginBottom: 0.5 }}
        >
          {t("quick_add_action_label")}
        </Typography>
        <TextField
          select
          label={t("quick_add_action_label")}
          value={actionValue}
          onChange={(e) => setActionValue(e.target.value)}
          size="small"
          fullWidth
        >
          {BUILDIN_ACTION_FIELD_CONFIGS.map((c) => {
            // Hide description when it looks like an untranslated i18n key (e.g. read_mode_desc)
            const desc =
              c.description && !/^[a-z0-9_]+_desc$/i.test(c.description)
                ? c.description
                : "";
            return (
              <MenuItem key={c.value} value={c.value}>
                {desc ? `${c.label} — ${desc}` : c.label}
              </MenuItem>
            );
          })}
        </TextField>
      </Box>
      <Box sx={{ marginBottom: 1.5 }}>
        <Typography
          variant="caption"
          display="block"
          sx={{ marginBottom: 0.5 }}
        >
          {t("quick_add_site_label")}
        </Typography>
        <TextField
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="https://example.com/*"
          size="small"
          fullWidth
        />
      </Box>
      <Button variant="contained" fullWidth onClick={onCreate} disabled={!cfg}>
        {t("quick_add_create_btn")}
      </Button>
    </Box>
  );
}

function Buttons() {
  const { state, dispatch } = useContext(PageContext);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const quickAddAnchor = React.useRef<HTMLButtonElement>(null);

  return (
    <Stack direction="row" spacing={1} sx={{ marginBottom: "10px" }}>
      <MenuBtn
        onClick={() =>
          chrome.tabs.create({ url: "https://iautomator.xyz/automations" })
        }
        icon={<Search sx={{ fontSize: "20px", cursor: "pointer" }} />}
        label={t("get_new_automations")}
      />

      <MenuBtn
        onClick={() =>
          dispatch({
            type: ACTIONS.AUTOMATION_FORM_UPDATE,
            payload: { instructions: "", pattern: "" },
          })
        }
        icon={<AddBox sx={{ fontSize: "20px", cursor: "pointer" }} />}
        label={t("add_automation")}
      />

      <Button
        ref={quickAddAnchor}
        onClick={() => setQuickAddOpen(true)}
        startIcon={<AddBox />}
      >
        {t("quick_add")}
      </Button>
      <Popover
        open={quickAddOpen}
        anchorEl={quickAddAnchor.current}
        onClose={() => setQuickAddOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
            {t("quick_add")}
          </Typography>
          <QuickAddContent
            state={state}
            dispatch={dispatch}
            onClose={() => setQuickAddOpen(false)}
          />
        </Box>
      </Popover>

      <MenuBtn
        onClick={() =>
          dispatch({
            type: ACTIONS.AUTOMATION_FORM_UPDATE,
            payload: {},
            editingMode: AmFormEditing.Script,
          })
        }
        icon={
          <KeyboardCommandKey sx={{ fontSize: "18px", cursor: "pointer" }} />
        }
        label={t("use_script_instead")}
      />
    </Stack>
  );
}

function MenuBtn(props: {
  onClick?: () => void;
  label: string;
  icon: React.ReactNode;
  styles?: React.CSSProperties;
}) {
  return (
    <Button
      onClick={props.onClick}
      startIcon={props.icon}
      sx={{ display: "flex", borderRadius: "6px", ...props.styles }}
    >
      {props.label}
    </Button>
  );
}

const defaultScript = `
# example, see: https://docs.iautomator.xyz/IScript_en.html
automation "weibo-readmode" {
  match "https://weibo.com/*"
  stage "load"
}
  apply READ_MODE with (autoScroll=true, excludes=".Frame_wrap_16as0") on "body"
end
`;

const EXAMPLE_AUTOMATION_SCRIPT = `# example, see: https://docs.iautomator.xyz/IScript_en.html
automation "zhihu-readmode" {
  match "https://www.zhihu.com/question/*"
  stage "load"
}
  apply READ_MODE with (autoScroll=true) on "#QuestionAnswers-answers"
end
`;

const EXAMPLE_AUTOMATION_PATTERN = "https://www.zhihu.com/question/*";
const EXAMPLE_AUTOMATION_NAME = "Zhihu Read Mode (example)";

function ScriptsEditor() {
  const { dispatch, state } = useContext(PageContext);
  const form = state.automationForm as PageState["automationForm"];
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [scripts, setScripts] = useState(
    (form.scripts || defaultScript).trim()
  );
  const [saving, setSaving] = useState(false);
  const onCloseAlert = () => {
    setError("");
    setSuccess("");
  };
  const onChange = (value: string) => {
    setScripts(value);
  };
  const onCancel = () => {
    dispatch({ type: ACTIONS.AUTOMATION_FORM_CLOSE, payload: null });
  };
  const onTest = () => {
    try {
      const result = parseIscript(scripts);
      console.log("parse scripts result: ", result);
      setError("");
      setSuccess("parse successfully");

      return result;
    } catch (error) {
      console.log(error);
      setSuccess("");
      setError(error.message);
      return false;
    }
  };
  const onSave = () => {
    setSaving(true);
    const result = onTest();
    if (result) {
      const metaName = result[0]?.name || "New Script";
      automationsController
        .saveAutomation(
          "",
          scripts,
          result[0].pattern,
          result[0].runAt,
          metaName,
          form.id
        )
        .then((resp) => {
          if (resp.code === 0) {
            setSaving(false);
            dispatch({ type: ACTIONS.AUTOMATION_FORM_CLOSE, payload: null });
            noticeBg({
              action: PAGE_ACTIONS.REFRESH_AUTOMATIONS,
            });
            noticeBg({
              action: APP_ACTIONS.AUTOMATION_UPDATED,
              data: {
                type: "create",
                new: {
                  id: form.id,
                  pattern: result[0].pattern,
                  runAt: result[0].runAt,
                  scripts,
                  active: true,
                  name: metaName,
                },
              },
            });
          }
        });
    } else {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="am-editor-template-hint" style={{ marginBottom: 6 }}>
        {t("template_script_hint")}
      </div>
      <TextField
        select
        label="Generate script from action template"
        size="small"
        fullWidth
        sx={{ marginBottom: 1 }}
        onChange={(e) => {
          const actionValue = e.target.value;
          const cfg = BUILDIN_ACTION_FIELD_CONFIGS.find(
            (item) => item.value === actionValue
          );
          if (!cfg) {
            return;
          }
          // 反向从 BUILTIN_ACTIONS 中找到 DSL 使用的大写常量名，例如 READ_MODE
          const builtinKey =
            Object.keys(BUILTIN_ACTIONS).find(
              (k) => (BUILTIN_ACTIONS as any)[k] === cfg.value
            ) || actionValue.toUpperCase();
          const host = state.tab?.host || "{host}";
          const templateName = `${cfg.value.toLowerCase()}-${host}`;
          const headerLines = [
            `# Template: ${cfg.label} (${builtinKey})`,
            `# This script was generated from action template. You can tweak url, selector and arguments.`,
            `automation "${templateName}" {`,
            `  match "https://${host}/*"`,
            `  stage "load"`,
            `}`,
          ];

          const bodyLines: string[] = [];
          if (!cfg.args || cfg.args.length === 0) {
            bodyLines.push(
              `  # This action has no configurable arguments currently.`
            );
            bodyLines.push(`  apply ${builtinKey} with () on "body"`);
          } else {
            const comments: string[] = [];
            const assignments: string[] = [];
            cfg.args.forEach((arg) => {
              const def =
                arg.defaultValue ??
                (arg.type === "number"
                  ? 0
                  : arg.type === "boolean"
                  ? false
                  : "");
              const valueStr =
                arg.type === "string" ? `"${def ?? ""}"` : String(def ?? "");
              const comment = arg.tips
                ? `  # ${arg.name}: ${arg.tips}`
                : `  # ${arg.name}`;
              comments.push(comment);
              assignments.push(`${arg.name}=${valueStr}`);
            });
            bodyLines.push(...comments);
            bodyLines.push(
              `  apply ${builtinKey} with (${assignments.join(", ")}) on "body"`
            );
          }
          bodyLines.push(`end`);

          const tpl = [...headerLines, ...bodyLines].join("\n");
          setScripts(tpl.trim());
          setError("");
          setSuccess("");
        }}
      >
        {BUILDIN_ACTION_FIELD_CONFIGS.map((cfg) => (
          <MenuItem key={cfg.value} value={cfg.value}>
            {`${cfg.value} - ${cfg.label}`}
          </MenuItem>
        ))}
      </TextField>
      {error && (
        <Alert severity="error" onClose={onCloseAlert}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={onCloseAlert}>
          {success}
        </Alert>
      )}
      <Editor
        value={scripts}
        onValueChange={onChange}
        highlight={(code) =>
          hightlightWithLineNumbers(code, iscript, "iscript")
        }
        padding={10}
        className="editor"
        style={{
          marginTop: "5px",
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 14,
          outline: 0,
          backgroundColor: "#f5f5f5",
          borderRadius: "6px",
        }}
      />
      <div className="am-editor-btns">
        <Button onClick={() => onCancel()} style={{ marginRight: "10px" }}>
          {t("cancel")}
        </Button>
        <Button onClick={() => onTest()} style={{ marginRight: "10px" }}>
          {t("test")}
        </Button>
        <Button disabled={saving} onClick={() => onSave()}>
          {t("save")}
        </Button>
      </div>
    </div>
  );
}

function validateAmForm(instructions: string, pattern: string) {
  if (instructions && pattern) {
    return true;
  } else {
    return false;
  }
}

function onAmFormChange(attrs, dispatch) {
  dispatch({ type: ACTIONS.AUTOMATION_FORM_UPDATE, payload: attrs });
}

function AutomationEditor() {
  const { state, dispatch } = useContext(PageContext);
  const form = state.automationForm as PageState["automationForm"];
  const initialDataRef = React.useRef(state.automationForm);
  const [saving, setSaving] = useState(false);
  const [allAutomations, setAllAutomations] = useState<IAutomation[]>([]);
  const [libraryAnchor, setLibraryAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const urlPatterns = getURLPatterns(state.tab.host, state.tab.pathname);
  const boxRef = React.useRef<HTMLDivElement>(null);

  function onAmEditorSaveClick() {
    const { pattern, data } = form;
    const astList: InstructionAST[] = data.map((item) => {
      const args = basicArgsHandler.parse(item.rawArgs, item.action);

      return {
        action: item.action,
        scope: item.scope,
        args,
      };
    });
    const instructions = stringifyInstructions(astList);

    if (validateAmForm(instructions, pattern)) {
      setSaving(true);
      automationsController
        .saveAutomation(
          instructions,
          "",
          pattern,
          form.runAt,
          form.name,
          form.id
        )
        .then((resp) => {
          if (resp.code === 0) {
            setSaving(false);
            dispatch({ type: ACTIONS.AUTOMATION_FORM_CLOSE, payload: null });
            noticeBg({
              action: APP_ACTIONS.AUTOMATION_UPDATED,
              data: {
                type: form.id ? "update" : "create",
                old: initialDataRef.current,
                new: {
                  ...form,
                  pattern,
                  instructions,
                },
              },
            });
          }
        });
    }
  }

  function onAmEditorCancleClick() {
    dispatch({ type: ACTIONS.AUTOMATION_FORM_CLOSE, payload: null });
  }

  useEffect(() => {
    boxRef.current?.scrollIntoView();
  }, [form.id]);

  useEffect(() => {
    automationsController.getList().then((res: Response) => {
      if (res.code === 0) {
        setAllAutomations(res.data ?? []);
      }
    });
  }, []);

  return (
    <div className="am-editor" ref={boxRef}>
      <div className="am-editor-copy">
        <TextField
          select
          label="Copy from existing automation"
          size="small"
          fullWidth
          onChange={(e) => {
            const id = Number(e.target.value);
            const source = allAutomations.find((item) => item.id === id);
            if (!source) {
              return;
            }
            const isScript = !!source.scripts;
            const instructions = source.instructions || "";
            const astList = !isScript
              ? parseInstructionContent(instructions)
              : [];
            const data =
              !isScript && astList.length
                ? astList.map((ast) => ({
                    action: ast.action,
                    rawArgs: basicArgsHandler.stringify(ast.args, ast.action),
                    scope: ast.scope,
                  }))
                : form.data;

            const nextForm = {
              ...form,
              id: undefined,
              name: source.name,
              runAt: source.runAt,
              // 不复制原来的域名 / pattern，使用当前表单里的（通常为空，由用户选择）
              pattern: form.pattern,
              instructions,
              scripts: source.scripts || "",
              data,
            };

            dispatch({
              type: ACTIONS.AUTOMATION_FORM_UPDATE,
              payload: nextForm,
              editingMode: isScript
                ? AmFormEditing.Script
                : AmFormEditing.Instruction,
            });
          }}
        >
          {allAutomations.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {`${item.name || "Automation"} (${item.pattern})`}
            </MenuItem>
          ))}
        </TextField>
      </div>
      <div className="am-editor-fields">
        <TextField
          value={form.name}
          placeholder={t("name")}
          className="ipt-name"
          size="small"
          fullWidth
          onChange={(event) => {
            onAmFormChange(
              {
                name: event.target.value,
              },
              dispatch
            );
          }}
        />
      </div>
      <div className="am-ins-editor-box">
        {form.data.map((item, index) => (
          <InstructionEditor
            form={item}
            dispatch={dispatch}
            index={index}
            key={index}
          />
        ))}
      </div>
      <Button
        size="small"
        startIcon={<AddBox />}
        onClick={(e) => setLibraryAnchor(e.currentTarget)}
      >
        {t("add_action")}
      </Button>
      <Popover
        open={Boolean(libraryAnchor)}
        anchorEl={libraryAnchor}
        onClose={() => setLibraryAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <ActionLibrary
          onAdd={(value) => {
            dispatch({
              type: ACTIONS.AUTOMATION_FORM_NEW_INS,
              payload: { index: form.data.length, action: value },
            });
            setLibraryAnchor(null);
          }}
        />
      </Popover>
      <div className="am-editor-fields">
        <Autocomplete
          freeSolo
          options={urlPatterns}
          value={form.pattern}
          onChange={(_, value) => {
            onAmFormChange(
              {
                pattern: value ?? "",
              },
              dispatch
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t("pattern")}
              size="small"
              className="ipt-pattern"
            />
          )}
          sx={{ width: 400, marginRight: "10px" }}
        />
        <Select
          value={form.runAt}
          size="small"
          sx={{ minWidth: 160 }}
          onChange={(e) => {
            onAmFormChange(
              {
                runAt: e.target.value,
              },
              dispatch
            );
          }}
        >
          {RUN_AT_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div className="am-editor-btns">
        <Button
          onClick={() => onAmEditorCancleClick()}
          style={{ marginRight: "10px" }}
        >
          {t("cancel")}
        </Button>
        <Button disabled={saving} onClick={() => onAmEditorSaveClick()}>
          {t("save")}
        </Button>
      </div>
    </div>
  );
}

function onAmFormInsChange(attrs, index: number, dispatch) {
  dispatch({
    type: ACTIONS.AUTOMATION_FORM_UPDATE_INS,
    payload: {
      changes: attrs,
      index,
    },
  });
}

function ActionArgsForm(props: {
  config?: ActionArg[];
  defaultValues: ExecOptions;
  onChange: (changedValues: any, values: any) => void;
}) {
  const { config: args = [], onChange, defaultValues } = props;
  const [values, setValues] =
    React.useState<Record<string, any>>(defaultValues);

  const handleFieldChange = (name: string, value: any) => {
    const next = { ...values, [name]: value };
    setValues(next);
    onChange({ [name]: value }, next);
  };

  return (
    <Box sx={{ width: "326px" }}>
      {args.map((arg) => (
        <ActionArgField
          arg={arg}
          key={arg.name}
          value={values[arg.name]}
          onChange={(value) => handleFieldChange(arg.name, value)}
        />
      ))}
    </Box>
  );
}

function ArgLabel(props: { name: string; tips?: string }) {
  const { name, tips } = props;
  if (!tips) return <>{name}</>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {name}
      <Tooltip title={tips}>
        <HelpOutline className="am-arg-tip-icon" fontSize="inherit" />
      </Tooltip>
    </span>
  );
}

function ActionArgField(props: {
  arg: ActionArg;
  value: any;
  onChange: (value: any) => void;
}) {
  const { arg, value, onChange } = props;
  const label = <ArgLabel name={arg.name} tips={arg.tips} />;

  if (arg.type === "boolean") {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
          />
        }
        label={label}
      />
    );
  }

  if (arg.type === "string" && arg.optionalValues) {
    return (
      <TextField
        select
        label={label}
        size="small"
        fullWidth
        margin="dense"
        value={value ?? arg.defaultValue ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {arg.optionalValues.map((item, index) => (
          <MenuItem key={index} value={item as string}>
            {item}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  return (
    <TextField
      label={label}
      type={arg.type === "number" ? "number" : undefined}
      size="small"
      fullWidth
      margin="dense"
      placeholder={arg.tips}
      value={value ?? arg.defaultValue ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function extractTemplateVars(values: unknown[]): string[] {
  const vars = new Set<string>();
  const re = /\{\{\s*([\w.-]+)\s*\}\}/g;

  values.forEach((value) => {
    if (typeof value === "string") {
      let match: RegExpExecArray | null;
      while ((match = re.exec(value))) {
        vars.add(match[1]);
      }
    }
  });

  return Array.from(vars);
}

function InstructionEditor(props: {
  form: Omit<InstructionAST, "args"> & { rawArgs: string };
  index: number;
  dispatch;
}) {
  const { form, dispatch } = props;
  const [expanded, setExpanded] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const actionItem = BUILDIN_ACTION_FIELD_CONFIGS.find(
    (item) => item.value === form.action
  );
  function onAddNewInsClick() {
    dispatch({
      type: ACTIONS.AUTOMATION_FORM_NEW_INS,
      payload: { index: props.index + 1 },
    });
  }
  function onDelInsClick() {
    dispatch({
      type: ACTIONS.AUTOMATION_FORM_DEL_INS,
      payload: { index: props.index },
    });
  }
  const onArgsChange = (action: string, values: any) => {
    const args = basicArgsHandler.stringify(values, action);
    onAmFormInsChange(
      {
        rawArgs: args,
      },
      props.index,
      dispatch
    );
  };

  const parsedArgs = basicArgsHandler.parse(form.rawArgs, actionItem?.value);
  const argSummary = Object.keys(parsedArgs)
    .filter((key) => key !== "silent")
    .map((key) => `${key}=${String(parsedArgs[key])}`)
    .join(", ");
  const inputVars = extractTemplateVars([
    ...Object.values(parsedArgs),
    form.scope,
  ]);
  const outputNames = actionItem?.outputs?.map((item) => item.name) ?? [];

  const dragging = dragIndex === props.index;
  const dragOver =
    dragOverIndex === props.index && dragIndex !== null && !dragging;

  return (
    <Card
      variant="outlined"
      className="am-ins-editor"
      draggable={false}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOverIndex(props.index);
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (dragIndex !== null && dragIndex !== props.index) {
          dispatch({
            type: ACTIONS.AUTOMATION_FORM_MOVE_INS,
            payload: { from: dragIndex, to: props.index },
          });
        }
        setDragIndex(null);
        setDragOverIndex(null);
      }}
      sx={{
        marginBottom: 1,
        opacity: dragging ? 0.4 : 1,
        borderColor: dragOver ? "primary.main" : undefined,
        borderWidth: dragOver ? 2 : 1,
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            size="small"
            draggable
            onDragStart={(e) => {
              setDragIndex(props.index);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setDragOverIndex(null);
            }}
            sx={{ cursor: "grab" }}
          >
            <DragIndicator fontSize="small" />
          </IconButton>
          <TextField
            select
            size="small"
            sx={{ width: 180 }}
            value={form.action}
            defaultValue={BUILTIN_ACTIONS.READ_MODE}
            onChange={(e) => {
              onAmFormInsChange(
                {
                  action: e.target.value,
                  rawArgs: "",
                },
                props.index,
                dispatch
              );
            }}
          >
            {BUILDIN_ACTION_FIELD_CONFIGS.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            placeholder={t("arguments")}
            value={argSummary}
            className="ipt-ins"
            size="small"
            sx={{ flex: 1, minWidth: 120 }}
            inputProps={{ readOnly: true }}
          />
          <TextField
            size="small"
            sx={{ width: 130 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">@</InputAdornment>
              ),
            }}
            placeholder="scope"
            onChange={(event) => {
              onAmFormInsChange(
                {
                  scope: event.target.value,
                },
                props.index,
                dispatch
              );
            }}
            value={form.scope}
          />
          <Tooltip title={expanded ? t("hide_args") : t("show_args")}>
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              {expanded ? (
                <ExpandLess fontSize="small" />
              ) : (
                <ExpandMore fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title={t("insert_below")}>
            <IconButton size="small" onClick={onAddNewInsClick}>
              <AddBox fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("delete")}>
            <IconButton size="small" onClick={onDelInsClick}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        {(inputVars.length > 0 || outputNames.length > 0) && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ marginTop: 1, flexWrap: "wrap", gap: 0.5 }}
          >
            {outputNames.map((name) => {
              const output = actionItem?.outputs?.find(
                (item) => item.name === name
              );
              return (
                <Tooltip key={name} title={output?.description ?? name}>
                  <Chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    label={`→ ${name}`}
                  />
                </Tooltip>
              );
            })}
            {inputVars.map((name) => (
              <Tooltip key={name} title={t("variable_hint")}>
                <Chip size="small" label={`{{${name}}}`} />
              </Tooltip>
            ))}
          </Stack>
        )}
        {expanded && (
          <Box
            sx={{
              marginTop: 1,
              paddingTop: 1,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <ActionArgsForm
              config={actionItem?.args}
              defaultValues={parsedArgs}
              onChange={(_, values) => onArgsChange(actionItem?.value, values)}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function ActionLibrary(props: { onAdd: (value: string) => void }) {
  const [keyword, setKeyword] = useState("");

  const list = BUILDIN_ACTION_FIELD_CONFIGS.filter((cfg) => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) {
      return true;
    }

    return (
      cfg.label.toLowerCase().includes(kw) ||
      cfg.value.toLowerCase().includes(kw) ||
      (cfg.description || "").toLowerCase().includes(kw)
    );
  });

  return (
    <Box sx={{ width: 340 }}>
      <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5 }}>
        {t("action_library")}
      </Typography>
      <TextField
        autoFocus
        size="small"
        fullWidth
        placeholder={t("search_actions")}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        sx={{ p: 1, pb: 0.5 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <Box sx={{ maxHeight: 320, overflow: "auto", p: 0.5 }}>
        {list.map((cfg) => (
          <ListItemButton
            key={cfg.value}
            onClick={() => props.onAdd(cfg.value)}
          >
            <ListItemText primary={cfg.label} secondary={cfg.description} />
          </ListItemButton>
        ))}
        {list.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ p: 2, textAlign: "center" }}
          >
            No results
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function ItemName(props: any) {
  const { state, dispatch } = useModel();
  const [editable, setEditable] = useState(false);
  const [name, setName] = useState(props.record.name);
  const onChange = (event) => {
    setName(event.target.value);
  };
  const onEnter = () => {
    automationsController
      .updateAutomation(props.record.id, {
        name,
      })
      .then(() => {
        setEditable(false);
        fetchList(state, dispatch).then(() => {
          noticeBg({ action: PAGE_ACTIONS.REFRESH_AUTOMATIONS });
        });
      });
  };

  return (
    <TextField
      value={name}
      disabled={!editable}
      size="small"
      fullWidth
      onChange={onChange}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onEnter();
        }
      }}
      InputProps={{
        endAdornment: !editable && (
          <IconButton size="small" onClick={() => setEditable(true)}>
            <Edit fontSize="small" />
          </IconButton>
        ),
      }}
    />
  );
}

function RunAt(props: any) {
  const { state, dispatch } = useModel();
  const onChange = useCallback((value) => {
    const oldRecord = { ...props.record };
    props.record.runAt = value;
    automationsController
      .updateAutomation(props.record.id, {
        runAt: value,
      })
      .then(() => {
        fetchList(state, dispatch).then(() => {
          noticeBg({ action: PAGE_ACTIONS.REFRESH_AUTOMATIONS });
          noticeBg({
            action: APP_ACTIONS.AUTOMATION_UPDATED,
            data: {
              type: "update",
              old: oldRecord,
              new: props.record,
            },
          });
        });
      });
  }, []);

  return (
    <Select
      value={props.record.runAt ?? RunAtEnum.END}
      size="small"
      sx={{ minWidth: 140 }}
      onChange={(e) => onChange(e.target.value)}
    >
      {RUN_AT_OPTIONS.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  );
}

function exportOneAutomation(record: IAutomation) {
  const item = {
    name: record.name,
    pattern: record.pattern,
    instructions: record.instructions ?? "",
    scripts: record.scripts ?? "",
    runAt: record.runAt ?? 1,
  };
  const name = (record.name || "automation").replace(
    /[^\w\u4e00-\u9fa5-]/g,
    "_"
  );
  downloadJson({ version: 1, automation: item }, `automation-${name}.json`);
}

function OpBtns(props: any) {
  return (
    <div
      className="op-btns"
      style={{ minWidth: "120px", display: "flex", alignItems: "center" }}
    >
      <SwitchBtn record={props.record} />
      <EditBtn record={props.record} />
      <Tooltip title={t("export_automation")}>
        <IconButton
          size="small"
          onClick={() => exportOneAutomation(props.record)}
        >
          <Download fontSize="small" />
        </IconButton>
      </Tooltip>
      <ShareBtn item={props.record} />
      <ShortcutBtn item={props.record} />
      <DeleteBtn record={props.record} />
    </div>
  );
}

function SwitchBtn(props: any) {
  const { state, dispatch } = useModel();
  const onChange = useCallback((checked) => {
    props.record.active = checked;
    automationsController
      .updateAutomation(props.record.id, {
        active: checked,
      })
      .then(() => {
        fetchList(state, dispatch).then(() => {
          noticeBg({
            action: APP_ACTIONS.AUTOMATION_UPDATED,
            data: {
              type: checked ? "create" : "delete",
              old: checked ? null : props.record,
              new: checked ? props.record : null,
            },
          });
        });
      });
  }, []);

  return (
    <Switch
      size="small"
      checked={props.record.active === true}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}

function EditBtn(props: { record: IAutomation }) {
  const { dispatch } = useModel();
  const onClick = useCallback(() => {
    const astList = parseInstructionContent(props.record.instructions || "");
    const data =
      astList.length > 0
        ? astList.map((ast) => ({
            action: ast.action,
            rawArgs: basicArgsHandler.stringify(ast.args, ast.action),
            scope: ast.scope,
          }))
        : [];
    const record = {
      ...props.record,
      data,
    };
    dispatch({
      type: ACTIONS.AUTOMATION_FORM_UPDATE,
      payload: record,
      editingMode: props.record.scripts
        ? AmFormEditing.Script
        : AmFormEditing.Instruction,
    });
  }, []);

  return (
    <IconButton size="small" onClick={onClick}>
      <Edit fontSize="small" />
    </IconButton>
  );
}

function getShareURL(item: Automation) {
  const { instructions, runAt, pattern } = item;

  return `https://iautomator.xyz/create?instructions=${encodeURIComponent(
    instructions
  )}&runAt=${runAt}&pattern=${encodeURIComponent(pattern)}`;
}

function ShareBtn(props: { item: Automation }) {
  const onClick = () => {
    const url = getShareURL(props.item);
    chrome.tabs.create({ url });
  };

  return (
    <IconButton size="small" onClick={onClick}>
      <Share fontSize="small" />
    </IconButton>
  );
}

function onShortcutBtnClick(record, dispatch) {
  const payload = {
    aid: record.id,
  };
  dispatch({ type: ACTIONS.TAB_CHANGE, payload: "shortcuts" });
  dispatch({ type: ACTIONS.SHORTCUT_FORM_UPDATE, payload });
}

function ShortcutBtn(props: { item: Automation }) {
  const { dispatch } = useModel();

  return (
    <IconButton
      size="small"
      onClick={() => onShortcutBtnClick(props.item, dispatch)}
    >
      <KeyboardCommandKey fontSize="small" />
    </IconButton>
  );
}

function DeleteBtn(props: any) {
  const { state, dispatch } = useModel();
  const onClick = useCallback(() => {
    automationsController.deleteItem(props.record.id).then(() => {
      fetchList(state, dispatch);
      noticeBg({
        action: APP_ACTIONS.AUTOMATION_UPDATED,
        data: {
          type: "delete",
          old: props.record,
        },
      });
    });
  }, []);

  return (
    <IconButton size="small" onClick={onClick}>
      <Delete fontSize="small" />
    </IconButton>
  );
}

function fetchList(state, dispatch) {
  return automationsController.getList().then((res: Response) => {
    if (res.code === 0) {
      dispatch({
        type: ACTIONS.AUTOMATIONS,
        payload: matchAutomations(res.data, state.tab.url),
      });
    }
  });
}

const scopeOptions = [
  {
    label: "Local",
    value: "local",
  },
  {
    label: "Global",
    value: "global",
  },
];

function EmptyAutomationsState(props: {
  state: PageState;
  dispatch: React.Dispatch<any>;
}) {
  const { state, dispatch } = props;
  const message = useMessage();
  const [adding, setAdding] = useState(false);
  const onAddExample = () => {
    setAdding(true);
    automationsController
      .saveAutomation(
        "",
        EXAMPLE_AUTOMATION_SCRIPT,
        EXAMPLE_AUTOMATION_PATTERN,
        RunAtEnum.END,
        EXAMPLE_AUTOMATION_NAME,
        undefined
      )
      .then((res: Response) => {
        if (res.code === 0) {
          fetchList(state, dispatch);
          noticeBg({ action: PAGE_ACTIONS.REFRESH_AUTOMATIONS });
          message.success(t("example_added_message"));
        }
        setAdding(false);
      });
  };
  const onAddAutomation = () => {
    dispatch({
      type: ACTIONS.AUTOMATION_FORM_UPDATE,
      payload: { instructions: "", pattern: "" },
    });
  };
  return (
    <div className="am-empty-state">
      <div className="am-empty-state-title">{t("empty_automations_title")}</div>
      <div className="am-empty-state-desc">{t("empty_automations_desc")}</div>
      <div className="am-empty-state-actions">
        <Button
          variant="contained"
          size="small"
          disabled={adding}
          onClick={onAddExample}
          style={{ marginRight: 8 }}
        >
          {adding && (
            <CircularProgress size={14} color="inherit" sx={{ mr: 1 }} />
          )}
          {t("add_example_automation")}
        </Button>
        <Button size="small" onClick={onAddAutomation}>
          {t("add_automation")}
        </Button>
      </div>
    </div>
  );
}

function Automations(props: any) {
  const { host } = props;
  const { state, dispatch } = useContext(PageContext);
  const [scope, setScope] = useState<"local" | "global">("local");
  const ev = state.execEvent;
  const isRunning = ev && RUNNING_STATUSES.has(ev.status);
  const list = useMemo(() => {
    return state.automations.filter((item) => {
      if (scope === "local") {
        return item.pattern !== "*";
      } else {
        return item.pattern === "*";
      }
    });
  }, [scope, state.automations]);

  useEffect(() => {
    fetchList(state, dispatch);
  }, [host, state.amFormEditing]);

  return (
    <div>
      <ToggleButtonGroup
        value={scope}
        exclusive
        size="small"
        onChange={(_, value) => value && setScope(value)}
        sx={{ marginBottom: 1 }}
      >
        {scopeOptions.map((opt) => (
          <ToggleButton key={opt.value} value={opt.value}>
            {opt.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "50px" }}>{t("id")}</TableCell>
              <TableCell sx={{ width: "180px" }}>{t("name")}</TableCell>
              <TableCell>{t("run_at")}</TableCell>
              <TableCell sx={{ width: "120px" }}>{t("operation")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((record) => {
              const active = isRunning && ev.automationId === record.id;
              return (
                <TableRow
                  key={record.id}
                  sx={active ? { bgcolor: "action.selected" } : undefined}
                >
                  <TableCell>
                    {active
                      ? `${record.id} · ${ev.index + 1}/${ev.total}`
                      : record.id}
                  </TableCell>
                  <TableCell>
                    <ItemName record={record} />
                  </TableCell>
                  <TableCell>
                    <RunAt record={record} />
                  </TableCell>
                  <TableCell>
                    <OpBtns record={record} />
                  </TableCell>
                </TableRow>
              );
            })}
            {list.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyAutomationsState state={state} dispatch={dispatch} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
