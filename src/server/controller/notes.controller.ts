import * as Code from "../common/code";
import Response from "../common/response";
import * as notesService from "../service/notes.service";

export async function saveNote(
  content: string,
  domain: string,
  path: string,
  nid?: number
): Promise<Response> {
  if (content && domain) {
    const result: number = await notesService.save(content, domain, path, nid);

    return Response.ok(result);
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function info(id: number): Promise<Response> {
  if (id) {
    const result = await notesService.selectOne(id);

    if (result) {
      return Response.ok(result);
    } else {
      return Response.error(Code.NOT_EXISTS);
    }
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function updateNote(id: number, changes: object) {
  if (id) {
    const result = await notesService.update(id, changes);

    return Response.ok(result);
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function query(query: object) {
  const result = await notesService.query(query);

  return Response.ok(result);
}

export async function list() {
  const result = await notesService.getAll();

  return Response.ok(result.filter((item) => item.nid == null).reverse());
}

export async function deleteItem(id: number) {
  const result = await notesService.deleteNote(id);

  return Response.ok(result);
}
