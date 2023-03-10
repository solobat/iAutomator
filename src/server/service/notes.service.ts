import { getDb } from "../db/database";
import Note from "../model/Note";

export async function save(
  content: string,
  domain: string,
  path: string,
  nid: number
) {
  const note: Note = new Note(content, domain, path, nid);
  const db = await getDb();

  return db.notes.put(note);
}

export async function selectOne(id: number) {
  const db = await getDb();

  return db.notes.get(id);
}

export async function getAll() {
  const db = await getDb();

  return db.notes.toArray();
}

export async function update(key, changes) {
  const db = await getDb();

  return db.notes.update(key, changes);
}

export async function deleteNote(id: number) {
  const db = await getDb();

  return db.notes.delete(id);
}

export async function query(attrs = {}) {
  const db = await getDb();

  return db.notes.where(attrs).reverse().sortBy("createTime");
}
