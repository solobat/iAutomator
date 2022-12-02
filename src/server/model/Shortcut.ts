import { IShortcut } from "../db/database";

export default class Shortcut implements IShortcut {
  id: number;
  aid?: number;
  wid?: number;
  shortcut: string;
  createTime?: number;
  updateTime?: number;
  deleted?: boolean;

  constructor(
    shortcut: string,
    aid?: number,
    wid?: number,
    createTime?: number
  ) {
    this.shortcut = shortcut;
    this.aid = aid;
    this.wid = wid;
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
