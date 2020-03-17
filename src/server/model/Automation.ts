import { IAutomation, db } from '../db/database'
import { RunAt } from '../enum/Automation';

export default class Automation implements IAutomation {
  id: number;
  rid?: number;
  recordId: number;
  runAt: RunAt;
  pattern?: string;
  createTime?: number;
  updateTime?: number;
  deleted?: boolean

  constructor(recordId: number, runAt: RunAt = RunAt.END, pattern: string, rid?: number, createTime?: number) {
    this.recordId = recordId;
    this.runAt = runAt;
    this.pattern = pattern;
    this.rid = rid;
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

db.automations.mapToClass(Automation);