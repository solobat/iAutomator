import { getDb } from "@src/server/db/database";
import { getLibs } from "chrome-extension-libs";
import Dexie from "dexie";

export function initLibs() {
  return getDb().then((db) => {
    const libs = getLibs({
      storageKey: "cuid",
      extName: "ihelpers",
      db: db as Dexie,
      dbNames: ["automations", "records", "notes"],
      ROOT_PATH: "/iHelpers",
    });

    return libs;
  });
}
