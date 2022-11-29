import Button from "antd/es/button";
import message from "antd/es/message";
import Upload from "antd/es/upload";
import * as React from "react";
import { useCallback } from "react";

import { t } from "@src/helper/i18n.helper";

import { APP_ACTIONS } from "../../../common/const";
import { PageMsg } from "../../../common/types";
import { exportAndDownload, importDBFile } from "../../../helper/db.helper";
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
  const onExportClick = useCallback(() => {
    exportAndDownload();
  }, []);
  const onImportFileBeforeUpload = useCallback((file) => {
    convertFile2Blob(file)
      .then(importDBFile)
      .then((blob) => {
        reload();
        message.success("Import done!");
      })
      .catch((err) => {
        message.error("Import failed!");
      });

    return false;
  }, []);

  return (
    <div className="btns">
      <Button type="primary" onClick={onExportClick}>
        {t("export")}
      </Button>
      <Upload
        name="file"
        accept="application/json"
        showUploadList={false}
        beforeUpload={onImportFileBeforeUpload}
      >
        <Button type="primary">{t("import")}</Button>
      </Upload>
    </div>
  );
}
