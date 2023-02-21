import { t } from "@src/helper/i18n.helper";
import { Button } from "antd";
import * as React from "react";

export function Help() {
  return (
    <ul style={{ listStyle: "none", paddingLeft: 0 }}>
      <li>
        <Button href="https://ihelpers.xyz/" target="_blank" type="link">
          {t("website")}
        </Button>
      </li>
      <li>
        <Button href="https://docs.ihelpers.xyz/" target="_blank" type="link">
          {t("documents")}
        </Button>
      </li>
    </ul>
  );
}
