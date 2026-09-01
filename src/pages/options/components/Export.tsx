import Button from "@mui/material/Button";
import { useCallback, useRef } from "react";

import { useExtlibsContext } from "@src/context/ExtlibsContext";
import { t } from "@src/helper/i18n.helper";
import { useMessage } from "@src/helper/message";

import { APP_ACTIONS } from "../../../common/const";
import { PageMsg } from "../../../common/types";
import { noticeBg } from "../../../helper/event";
import { convertFile2Blob } from "../../../helper/file.helper";

function reload() {
  const msg: PageMsg = {
    action: APP_ACTIONS.IMPORT_DATA,
    ext_from: "popup",
    data: null,
    callbackId: 0,
  };
  noticeBg(msg);
}

export default function Export() {
  const { libs } = useExtlibsContext();
  const message = useMessage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onExportClick = useCallback(() => {
    libs.DB.exportAndDownload();
  }, []);
  const onImportFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }
      convertFile2Blob(file)
        .then(libs.DB.importDBFile)
        .then((blob) => {
          reload();
          message.success("Import done!");
        })
        .catch((err) => {
          message.error("Import failed!");
        });
      e.target.value = "";
    },
    []
  );

  return (
    <div className="btns">
      <Button variant="contained" onClick={onExportClick}>
        {t("export")}
      </Button>
      <Button variant="contained" onClick={() => fileInputRef.current?.click()}>
        {t("import")}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        name="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={onImportFileChange}
      />
    </div>
  );
}
