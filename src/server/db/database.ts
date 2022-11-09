import Dexie from "dexie";
import { RunAt } from "../enum/Automation.enum";

export class StewardHelperDatabase extends Dexie {
  rules: Dexie.Table<IRule, number>;
  records: Dexie.Table<IRecord, number>;
  automations: Dexie.Table<IAutomation, number>;

  constructor() {
    super("StewardHelperDatabase");

    this.version(1).stores({
      rules: "++id,pattern,createTime,updateTime,deleted",
      records:
        "++id,rid,domain,url,content,times,createTime,updateTime,deleted",
      automations:
        "++id,rid,instructions,runAt,pattern,active,createTime,updateTime,deleted",
    });
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

export const db = new StewardHelperDatabase();
