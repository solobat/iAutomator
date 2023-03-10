import { INote } from "../db/database";

export default class Note implements INote {
  id: number;
  nid: number;
  content: string;
  domain: string;
  path: string;
  createTime: number;
  updateTime: number;
  deleted: boolean;

  constructor(
    content: string,
    domain: string,
    path: string,
    nid?: number,
    createTime?: number
  ) {
    this.content = content;
    this.path = path;
    this.domain = domain;
    this.nid = nid;
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
