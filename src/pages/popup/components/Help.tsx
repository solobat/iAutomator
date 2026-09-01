import { t } from "@src/helper/i18n.helper";
import { Button } from "@mui/material";
import * as React from "react";

export function Help() {
  return (
    <ul style={{ listStyle: "none", paddingLeft: 0 }}>
      <li>
        <Button
          href="https://iautomator.xyz/"
          target="_blank"
          rel="noreferrer"
          variant="text"
        >
          {t("website")}
        </Button>
      </li>
      <li>
        <Button
          href="https://docs.iautomator.xyz/"
          target="_blank"
          rel="noreferrer"
          variant="text"
        >
          {t("documents")}
        </Button>
      </li>
    </ul>
  );
}
