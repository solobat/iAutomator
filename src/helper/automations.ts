import { EXISTS } from "../server/common/code";
import Response from "../server/common/response";
import { saveAutomation } from "../server/controller/automations.controller";
import { IAutomation } from "../server/db/database";
import { RunAt } from "../server/enum/Automation.enum";
import { getAll } from "../server/service/automations.service";

export function matchAutomations(
  list: IAutomation[],
  url: string
): IAutomation[] {
  return list.filter((item) => {
    const { pattern } = item;
    const regExp = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");

    return regExp.test(url);
  });
}

export async function installAutomation(
  instructions,
  pattern,
  runAt = RunAt.END
) {
  const list = await getAll();
  const hasOne = list.find(
    (item) => item.instructions === instructions && item.pattern === pattern
  );

  if (hasOne) {
    return Response.error(EXISTS);
  } else {
    return saveAutomation(instructions, "", pattern, runAt);
  }
}
