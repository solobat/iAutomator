import { IAutomation } from "../db/database";
import { RunAt } from "../enum/Automation.enum";

export default class Automation implements IAutomation {
  id: number;
  rid?: number;
  instructions: string;
  scripts: string;
  runAt?: RunAt;
  pattern: string;
  active?: boolean;
  createTime?: number;
  updateTime?: number;
  deleted?: boolean;
  name?: string;

  constructor(
    instructions: string,
    scripts: string,
    runAt: RunAt = RunAt.END,
    pattern: string,
    name?: string,
    rid?: number,
    createTime?: number
  ) {
    this.instructions = instructions;
    this.scripts = scripts;
    this.runAt = runAt;
    this.pattern = pattern;
    this.rid = rid;
    this.deleted = false;
    this.name = name;
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
