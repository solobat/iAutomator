import { checkDB, getVersion, Schema } from "@src/helper/dexie";
import { show } from "@src/utils/log";
import Dexie from "dexie";

import { RunAt } from "../enum/Automation.enum";
import Automation from "../model/Automation";
import Note from "../model/Note";
import Record from "../model/Record";
import Shortcut from "../model/Shortcut";

const DB_NAME = "StewardHelperDatabase";
export const MIN_VERSION = 10;
const schema: Schema = {
  rules: "++id,pattern,createTime,updateTime,deleted",
  records: "++id,rid,domain,url,content,times,createTime,updateTime,deleted",
  automations:
    "++id,rid,instructions,runAt,pattern,active,createTime,updateTime,deleted",
  shortcuts: "++id,name,shortcut,aid,wid,action,createTime,updateTime,deleted",
  notes: "++id,content,domain,path,nid,createTime,updateTime,deleted",
};

export class IHelpersDatabase extends Dexie {
  rules: Dexie.Table<IRule, number>;
  records: Dexie.Table<IRecord, number>;
  automations: Dexie.Table<IAutomation, number>;
  notes: Dexie.Table<INote, number>;
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

export interface INote {
  id?: number;
  nid?: number;
  content: string;
  domain: string;
  path: string;
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
  name?: string;
  shortcut: string;
  aid?: number;
  wid?: number;
  action?: string;
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
    db.notes.mapToClass(Note);

    return db;
  }
}

export async function checkUpdate() {
  return checkDB(MIN_VERSION, DB_NAME, schema);
}
