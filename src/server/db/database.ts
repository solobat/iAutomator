import { checkDB, getVersion, Schema } from "@src/helper/dexie";
import { show } from "@src/utils/log";
import Dexie from "dexie";

import { RunAt } from "../enum/Automation.enum";
import Automation from "../model/Automation";
import Record from "../model/Record";
import Shortcut from "../model/Shortcut";

const DB_NAME = "StewardHelperDatabase";
export const MIN_VERSION = 6;
const schema: Schema = {
  rules: "++id,pattern,createTime,updateTime,deleted",
  records: "++id,rid,domain,url,content,times,createTime,updateTime,deleted",
  automations:
    "++id,rid,instructions,runAt,pattern,active,createTime,updateTime,deleted",
  shortcuts: "++id,shortcuts,aid,wid,createTime,updateTime,deleted",
};

export class IHelpersDatabase extends Dexie {
  rules: Dexie.Table<IRule, number>;
  records: Dexie.Table<IRecord, number>;
  automations: Dexie.Table<IAutomation, number>;
  shortcuts: Dexie.Table<IShortcut, number>;

  constructor(v: number) {
    super(DB_NAME);

    this.version(v).stores(schema);
  }
}

export interface IRule {
  id?: number;
  pattern: string;
  createTime?: number;
  updateTime?: number;
  deleted?: boolean;
}

export interface IRecord {
  id?: number;
  rid: number;
  url: string;
  content: string;
  domain: string;
  times: number;
  createTime?: number;
  updateTime?: number;
  deleted?: boolean;
}

export interface IAutomation {
  id?: number;
  rid?: number;
  pattern: string;
  instructions: string;
  runAt?: RunAt;
  active?: boolean;
  createTime?: number;
  updateTime?: number;
  deleted?: boolean;
}

export interface IShortcut {
  id?: number;
  shortcut: string;
  aid?: number;
  wid?: number;
  createTime?: number;
  updateTime?: number;
  deleted?: boolean;
}

let db: IHelpersDatabase;

export async function getDb() {
  if (db) {
    return db;
  } else {
    const v = await getVersion();
    show("now version: ", v);

    db = new IHelpersDatabase(v);
    db.shortcuts.mapToClass(Shortcut);
    db.automations.mapToClass(Automation);
    db.records.mapToClass(Record);

    return db;
  }
}

export async function checkUpdate() {
  return checkDB(MIN_VERSION, DB_NAME, schema);
}
