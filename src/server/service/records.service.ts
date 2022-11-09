import { db } from "../db/database";
import Record from "../model/Record";

export function save(
  rid: number,
  url: string,
  domain: string,
  content: string
) {
  const record: Record = new Record(rid, url, domain, content);

  return db.records.put(record);
}

export function selectOne(id: number) {
  return db.records.get(id);
}

export function getAll() {
  return db.records.toArray();
}

export function update(key, changes) {
  return db.records.update(key, changes);
}

export function deleteRecord(recordId: number) {
  return db.records.delete(recordId);
}

export function query(attrs = {}) {
  return db.records.where(attrs).reverse().sortBy("createTime");
}
