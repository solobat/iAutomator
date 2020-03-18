import { IAutomation, db } from '../db/database'
import { RunAt } from '../enum/Automation';

export default class Automation implements IAutomation {
  id: number;
  rid?: number;
  instructions: string;
  runAt?: RunAt;
  pattern: string;
  active?: boolean;
  createTime?: number;
  updateTime?: number;
  deleted?: boolean

  constructor(instructions: string, runAt: RunAt = RunAt.END, pattern: string, rid?: number, createTime?: number) {
    this.instructions = instructions;
    this.runAt = runAt;
    this.pattern = pattern;
    this.rid = rid;
    this.deleted = false;
    this.active = true;

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