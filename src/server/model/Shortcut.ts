import { IShortcut } from "../db/database";

export default class Shortcut implements IShortcut {
  id: number;
  aid?: number;
  wid?: number;
  action?: string;
  shortcut: string;
  name?: string;
  createTime?: number;
  updateTime?: number;
  deleted?: boolean;

  constructor(
    shortcut: string,
    aid?: number,
    wid?: number,
    action?: string,
    name?: string,
    createTime?: number
  ) {
    if (!aid && !wid && !action) {
      throw new Error("At least one of aid or wid or action must not be null");
    }

    this.shortcut = shortcut;
    this.aid = aid;
    this.wid = wid;
    this.action = action;
    this.name = name;
    this.deleted = false;

    if (createTime) {
      this.createTime = createTime;
      this.updateTime = createTime;
    } else {
      this.createTime = Number(new Date());
      this.updateTime = this.createTime;
    }
  }
}
