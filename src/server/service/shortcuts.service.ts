import { getDb } from "../db/database";
import Shortcut from "../model/Shortcut";

export async function save(
  key: string,
  aid?: number,
  wid?: number,
  action?: string,
  name?: string
) {
  const shortcut: Shortcut = new Shortcut(key, aid, wid, action, name);
  const db = await getDb();

  return db.shortcuts.put(shortcut);
}

export async function selectOne(id: number) {
  const db = await getDb();

  return db.shortcuts.get(id);
}

export async function getAll() {
  const db = await getDb();

  return db.shortcuts.toArray();
}

export async function update(key, changes) {
  const db = await getDb();

  return db.shortcuts.update(key, changes);
}

export async function deleteRecord(recordId: number) {
  const db = await getDb();

  return db.shortcuts.delete(recordId);
}

export async function query(attrs = {}) {
  const db = await getDb();

  return db.shortcuts.where(attrs).reverse().sortBy("createTime");
}
