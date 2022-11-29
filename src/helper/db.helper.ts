import { exportDB, importInto } from "dexie-export-import";
import download from "downloadjs";

import { db } from "../server/db/database";

export async function exportAndDownload() {
  const blob = await exportDB(db);

  download(blob, "iHelpers-export.json", "application/json");
}

function readBlob(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = () => reject(new Error("file read aborted"));
    reader.onerror = (event) => reject(event.target.error);
    reader.onload = (event) => resolve(event.target.result);
    reader.readAsText(blob);
  });
}

export async function exportAsJson() {
  const blob = await exportDB(db);

  return readBlob(blob);
}

export async function importDBFile(blob) {
  await importInto(db, blob, {
    clearTablesBeforeImport: true,
  });
}

export function onDbUpdate(callback) {
  const dbNames = ["automations", "records"];
  const eventNames = ["creating", "updating", "deleting"];
  const unbindFns = [];

  dbNames.forEach((name) => {
    eventNames.forEach((event) => {
      db[name].hook(event, callback);
      unbindFns.push(() => {
        db[name].hook(event).unsubscribe(callback);
      });
    });
  });

  return unbindFns;
}
