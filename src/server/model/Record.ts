import { IRecord, db } from '../db/database'

export default class Record implements IRecord {
  id: number;
  rid: number;
  url: string;
  content: string;
  domain: string;
  times: number;
  createTime: number;
  updateTime: number;
  deleted: boolean;

  constructor(rid: number, url: string, domain: string, content: string, createTime?: number) {
    this.rid = rid;
    this.url = url;
    this.content = content;
    this.domain = domain;
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

db.records.mapToClass(Record);