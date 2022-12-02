import { getDb } from "../db/database";
import { RunAt } from "../enum/Automation.enum";
import Automation from "../model/Automation";

export async function save(
  instructions: string,
  runAt: RunAt,
  pattern?: string
) {
  const automation: Automation = new Automation(instructions, runAt, pattern);
  const db = await getDb();

  return db.automations.put(automation);
}

export async function selectOne(id: number) {
  const db = await getDb();

  return db.automations.get(id);
}

export async function getAll() {
  const db = await getDb();

  return db.automations.toArray();
}

export async function update(key, changes) {
  const db = await getDb();

  return db.automations.update(key, changes);
}

export async function deleteAutomation(id: number) {
  const db = await getDb();

  return db.automations.delete(id);
}
