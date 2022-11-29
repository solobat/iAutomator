import { BUILDIN_ACTIONS } from "../common/const";
import { getHost } from "../helper/url";
import Base from "./Base";
import { ActionHelper, ExecOptions } from "./types";

export default class Download extends Base {
  name = BUILDIN_ACTIONS.DOWNLOAD;

  private downloaded = true;
  private autoclose = false;

  constructor(helper: ActionHelper<Base>) {
    super(helper, {
      withOutline: true,
    });
  }

  private downloadURL(url, fileName?, type?: string) {
    if (url.startsWith("//")) {
      url = location.protocol + url;
    }
    if (getHost(url) !== window.location.host) {
      window.open(url + this.getSuffix(type));
    } else {
      const elem = document.createElement("a");

      elem.setAttribute("href", url);
      elem.setAttribute("download", fileName);
      document.body.appendChild(elem);
      elem.click();

      elem.remove();
      if (this.autoclose) {
        window.close();
      }
    }
  }

  private getFileNameByURL(elem, url, type = "file", ext?) {
    const baseName =
      elem.getAttribute("alt") || elem.getAttribute("title") || type;
    if (!ext) {
      const m = url.match(/\.(\w+)$/);
      if (m) {
        ext = m[1];
      } else {
        ext = "";
      }
    }

    return `${baseName}.${ext}`;
  }

  private downloadBg(elem): boolean {
    const bgImg = window.getComputedStyle(elem).backgroundImage;
    const match = bgImg.match(/url\(["']?(.*\w)["']?\)/);

    if (match) {
      const url = match[1];
      this.downloadURL(
        url,
        this.getFileNameByURL(elem, url, "background"),
        "img"
      );

      return true;
    } else {
      return true;
    }
  }

  private getSuffix(tag = "file") {
    return `#/shd=${tag}`;
  }

  private downloadSource(elem): boolean {
    const url = elem.getAttribute("src");

    if (url) {
      const tag: string = elem.tagName.toLowerCase();

      this.downloadURL(url, this.getFileNameByURL(elem, url, tag), tag);

      return true;
    } else {
      return false;
    }
  }

  checkExecResult() {
    if (!this.downloaded) {
      this.autoMationFn();
    }
  }

  execute(elem, options: Partial<ExecOptions>) {
    const tagName = elem.tagName;

    this.autoclose = options.autoclose;

    if (["VIDEO", "IMG", "AUDIO", "SOURCE"].indexOf(tagName) !== -1) {
      const result = this.downloadSource(elem);
      this.downloaded = result;

      if (result) {
        this.recordIfNeeded(options, elem);
      }

      return true;
    } else {
      const result = this.downloadBg(elem);
      this.downloaded = result;

      if (result) {
        this.recordIfNeeded(options, elem);
      }

      return true;
    }
  }
}
