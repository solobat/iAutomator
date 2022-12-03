import * as Code from "../common/code";
import Response from "../common/response";
import * as shortcutsService from "../service/shortcuts.service";

export async function saveShortcut(
  key: string,
  aid?: number,
  wid?: number,
  action?: string,
  name?: string,
  id?: number
): Promise<Response> {
  if (key && (aid || wid)) {
    if (id) {
      const result = await shortcutsService.update(id, {
        shortcut: key,
        aid,
        wid,
        action,
        name,
      });

      return Response.ok(result);
    } else {
      const result: number = await shortcutsService.save(
        key,
        aid,
        wid,
        action,
        name
      );

      return Response.ok(result);
    }
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function info(id: number): Promise<Response> {
  if (id) {
    const result = await shortcutsService.selectOne(id);

    if (result) {
      return Response.ok(result);
    } else {
      return Response.error(Code.NOT_EXISTS);
    }
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function updateRecord(recordId: number, changes: object) {
  if (recordId) {
    const result = await shortcutsService.update(recordId, changes);

    return Response.ok(result);
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function query(query: object) {
  const result = await shortcutsService.query(query);

  return Response.ok(result);
}

export async function queryByAids(aids: number[]) {
  const all = await shortcutsService.getAll();
  const result = all.filter((item) => aids.includes(item.aid));

  return Response.ok(result);
}

export async function queryByWids(wids: number[]) {
  const all = await shortcutsService.getAll();
  const result = all.filter((item) => wids.includes(item.wid));

  return Response.ok(result);
}

export async function deleteItem(id: number) {
  const result = await shortcutsService.deleteRecord(id);

  return Response.ok(result);
}
