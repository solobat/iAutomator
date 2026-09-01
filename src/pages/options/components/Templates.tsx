import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { AddBox, Link } from "@mui/icons-material";
import { t } from "@src/helper/i18n.helper";
import { useMessage } from "@src/helper/message";
import { noticeBg } from "@src/helper/event";
import { EXISTS } from "@src/server/common/code";
import { PAGE_ACTIONS } from "@src/common/const";
import { BUILDIN_ACTION_FIELD_CONFIGS } from "@src/common/const";
import {
  InstructionAST,
  parseInstructionContent,
  stringifyInstructions,
} from "@src/helper/instruction";
import { installAutomation } from "@src/helper/automations";
import * as automationsController from "@src/server/controller/automations.controller";
import { RunAt } from "@src/server/enum/Automation.enum";

function templateInstructions(cfg: {
  value: string;
  args?: Array<{ name: string; type: string; defaultValue?: unknown }>;
}) {
  const args: Record<string, unknown> = {};
  cfg.args?.forEach((arg) => {
    args[arg.name] =
      arg.defaultValue !== undefined
        ? arg.defaultValue
        : arg.type === "number"
        ? 0
        : arg.type === "boolean"
        ? false
        : "";
  });
  const ast: InstructionAST = { action: cfg.value, scope: "body", args };

  return stringifyInstructions([ast]);
}

function deriveName(instructions: string): string {
  const list = parseInstructionContent(instructions);
  const cfg = list.length
    ? BUILDIN_ACTION_FIELD_CONFIGS.find((item) => item.value === list[0].action)
    : undefined;

  return cfg ? `${cfg.label} - Shared` : "Shared Automation";
}

export function Templates(props: { onInstalled: () => void }) {
  const message = useMessage();
  const [link, setLink] = useState("");
  const [installing, setInstalling] = useState(false);

  const onInstallLink = () => {
    try {
      const url = new URL(link.trim());
      const instructions = url.searchParams.get("instructions") ?? "";
      const scripts = url.searchParams.get("scripts") ?? "";
      const pattern = url.searchParams.get("pattern") || "*";
      const rawRunAt = url.searchParams.get("runAt");
      const runAt = (rawRunAt ? Number(rawRunAt) : RunAt.END) as RunAt;
      const name = url.searchParams.get("name") || deriveName(instructions);

      if (!instructions && !scripts) {
        message.error(t("install_failed"));
        return;
      }

      setInstalling(true);
      installAutomation(instructions, pattern, runAt, name, scripts).then(
        (resp) => {
          setInstalling(false);
          if (resp.code === 0) {
            noticeBg({ action: PAGE_ACTIONS.REFRESH_AUTOMATIONS });
            message.success(t("installed_ok"));
            props.onInstalled();
          } else if (resp.code === EXISTS.code) {
            message.error(t("duplicated"));
          } else {
            message.error(t("install_failed"));
          }
        }
      );
    } catch (error) {
      message.error(t("install_failed"));
    }
  };

  const onAddTemplate = (cfg: typeof BUILDIN_ACTION_FIELD_CONFIGS[number]) => {
    const instructions = templateInstructions(cfg);
    const name = `${cfg.label} (template)`;

    installAutomation(instructions, "*", RunAt.END, name).then((resp) => {
      if (resp.code === 0) {
        // 模板默认不激活，避免用户还没配置 pattern 就在所有页面执行
        automationsController
          .updateAutomation(resp.data, { active: 0 })
          .then(() => {
            noticeBg({ action: PAGE_ACTIONS.REFRESH_AUTOMATIONS });
            message.success(t("template_added"));
            props.onInstalled();
          });
      } else if (resp.code === EXISTS.code) {
        message.error(t("duplicated"));
      }
    });
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {t("templates_desc")}
      </Typography>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              fullWidth
              placeholder={t("install_from_link_placeholder")}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onInstallLink();
                }
              }}
              InputProps={{
                startAdornment: (
                  <Link fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
                ),
              }}
            />
            <Button
              variant="contained"
              disabled={installing || !link.trim()}
              onClick={onInstallLink}
              sx={{ whiteSpace: "nowrap" }}
            >
              {t("install")}
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {t("share_link_import")}
          </Typography>
        </CardContent>
      </Card>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
        {BUILDIN_ACTION_FIELD_CONFIGS.filter((cfg) => cfg.description).map(
          (cfg) => (
            <Card key={cfg.value} variant="outlined" sx={{ width: 280 }}>
              <CardContent>
                <Typography variant="subtitle2">{cfg.label}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ minHeight: 32, my: 0.5 }}
                >
                  {cfg.description}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                  {cfg.args?.map((arg) => (
                    <Chip key={arg.name} size="small" label={arg.name} />
                  ))}
                </Stack>
                <Tooltip title={t("add_action")}>
                  <Button
                    size="small"
                    startIcon={<AddBox />}
                    onClick={() => onAddTemplate(cfg)}
                    sx={{ mt: 1 }}
                  >
                    {t("add_action")}
                  </Button>
                </Tooltip>
              </CardContent>
            </Card>
          )
        )}
      </Stack>
    </Box>
  );
}
