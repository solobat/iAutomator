import { NOTICE_TARGET } from "@src/common/enum";
import { BUILDIN_ACTIONS, PAGE_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export interface CreateNoteExecOptions extends ExecOptions {
  isComment?: boolean;
}

const NID_KEY = "ihelpers_nid";
const NID_KEY_CONTENT = "ihelpers_nid_content";

export class CreateNote extends Base {
  name = BUILDIN_ACTIONS.NOTE;

  private create(content: string, isComment: boolean, nid?: number) {
    const data = {
      content,
      domain: window.location.hostname,
      path: window.location.pathname,
      nid,
    };
    if (isComment) {
      const comment = window.prompt(`Comment: ${content}`);

      if (comment) {
        data.content = comment;
      } else {
        return;
      }
    }

    this.helper.invoke(
      PAGE_ACTIONS.CREATE_NOTE,
      data,
      (res) => {
        if (!isComment) {
          window.sessionStorage.setItem(NID_KEY, String(res.data));
          window.sessionStorage.setItem(NID_KEY_CONTENT, data.content);
        }
      },
      NOTICE_TARGET.BACKGROUND
    );
  }

  execute(_, options: Partial<CreateNoteExecOptions>) {
    if (options.isComment) {
      const nid = window.sessionStorage.getItem(NID_KEY);
      const content = window.sessionStorage.getItem(NID_KEY_CONTENT);

      this.create(content, true, Number(nid));
    } else {
      this.create(options.value, false);
    }
    this.recordIfNeeded(options);
    setTimeout(() => {
      this.callNext(options, options);
    }, 1000);

    return true;
  }
}
