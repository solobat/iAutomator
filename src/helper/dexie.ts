import { show } from "@src/utils/log";
import Dexie from "dexie";

export interface Schema {
  [tableName: string]: string | null;
}

export function getVersion() {
  return indexedDB.databases().then((dbs) => {
    if (dbs.length) {
      // TODO: get db by name
      return dbs[0].version / 10;
    } else {
      return 1;
    }
  });
}

async function changeSchema(
  db: Dexie,
  schemaChanges: Schema,
  newVersion: number
) {
  db.close();
  const newDb = new Dexie(db.name);

  newDb.on("blocked", () => false);

  if (db.tables.length === 0) {
    await db.delete();

    newDb.version(newVersion).stores(schemaChanges);

    return await newDb.open();
  }

  const currentSchema = db.tables.reduce((result, { name, schema }) => {
    result[name] = [
      schema.primKey.src,
      ...schema.indexes.map((idx) => idx.src),
    ].join(",");
    return result;
  }, {} as { [key: string]: any });

  newDb.version(db.verno).stores(currentSchema);

  newDb.version(newVersion).stores(schemaChanges);

  return await newDb.open();
}

export async function dbUpdate(
  newVersion: number,
  name: string,
  schema: Schema
) {
  let db = new Dexie(name);

  if (!(await Dexie.exists(db.name))) {
    show("Db does not exist");

    return;
  }

  await db.open();

  db = await changeSchema(db, schema, newVersion);
}

export async function checkDB(
  newVersion: number,
  name: string,
  schema: Schema
) {
  const nowVersion = await getVersion();

  if (nowVersion && nowVersion < newVersion) {
    show("db should update...");
    await dbUpdate(newVersion, name, schema);
  } else {
    show("version is latest, no update");
    // const db = await getDb();
    // db.version(MIN_VERSION).stores(schema);
  }
}
