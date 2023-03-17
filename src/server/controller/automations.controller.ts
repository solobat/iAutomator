import * as Code from "../common/code";
import Response from "../common/response";
import { RunAt } from "../enum/Automation.enum";
import * as automationService from "../service/automations.service";

export async function saveAutomation(
  instructions: string,
  scripts: string,
  pattern: string,
  runAt: RunAt = RunAt.END,
  id?: number
): Promise<Response> {
  if (instructions || scripts) {
    if (id) {
      const result = await automationService.update(id, {
        instructions,
        scripts,
        pattern,
        runAt,
      });

      return Response.ok(result);
    } else {
      const result: number = await automationService.save(
        instructions,
        scripts,
        runAt,
        pattern
      );

      return Response.ok(result);
    }
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function info(id: number): Promise<Response> {
  if (id) {
    const result = await automationService.selectOne(id);

    if (result) {
      return Response.ok(result);
    } else {
      return Response.error(Code.NOT_EXISTS);
    }
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function updateAutomation(id: number, changes: object) {
  if (id) {
    const result = await automationService.update(id, changes);

    return Response.ok(result);
  } else {
    return Response.error(Code.PARAMS_ERROR);
  }
}

export async function getList() {
  const result = await automationService.getAll();

  return Response.ok(result);
}

export async function deleteItem(id: number) {
  const result = await automationService.deleteAutomation(id);

  return Response.ok(result);
}
