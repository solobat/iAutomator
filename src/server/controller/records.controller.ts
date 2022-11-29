import * as Code from "../common/code";
import Response from "../common/response";
import * as recordService from "../service/records.service";

export async function saveRecord(
  content: string,
  url: string,
  domain: string
): Promise<Response> {
  if (content && url) {
    const result: number = await recordService.save(0, url, domain, content);

    return Response.ok(result);
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function info(id: number): Promise<Response> {
  if (id) {
    const result = await recordService.selectOne(id);

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
    const result = await recordService.update(recordId, changes);

    return Response.ok(result);
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function query(query: object) {
  const result = await recordService.query(query);

  return Response.ok(result);
}
