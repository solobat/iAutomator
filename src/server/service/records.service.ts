import { getDb } from "../db/database";
import Record from "../model/Record";

export async function save(
  rid: number,
  url: string,
  domain: string,
  content: string
) {
  const record: Record = new Record(rid, url, domain, content);
  const db = await getDb();

  return db.records.put(record);
}

export async function selectOne(id: number) {
  const db = await getDb();

  return db.records.get(id);
}

export async function getAll() {
  const db = await getDb();

  return db.records.toArray();
}

export async function update(key, changes) {
  const db = await getDb();

  return db.records.update(key, changes);
}

export async function deleteRecord(recordId: number) {
  const db = await getDb();

  return db.records.delete(recordId);
}

export async function query(attrs = {}) {
  const db = await getDb();

  return db.records.where(attrs).reverse().sortBy("createTime");
}
