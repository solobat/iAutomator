import { throttle } from "lodash";
import { SYNC_STATUS, WEBDAV_MAX_SYNC_INTERVAL, WEBDAV_MIN_SYNC_INTERVAL } from "../common/const";
import { onDbUpdate } from "./db.helper";
import { createDataSyncTick, isWebDavConfiged } from "./webdav";

export default class Sync {
  syncStatus;
  syncTimer = 0;

  constructor() {
    this.tryStartSync();

    onDbUpdate(() => {
      this.tryStartSync();
    })
  }
  
  stopSync() {
    clearInterval(this.syncTimer);
    this.syncStatus = SYNC_STATUS.WAIT;
  }

  async runDataSyncTick() {
    try {
      const shouldUpdate = await createDataSyncTick();
  
      if (shouldUpdate) {
        // this.eventHub.$emit('import:done');
      }
      this.syncStatus = SYNC_STATUS.SUCCESS;
    } catch (error) {
      console.log(error); 
      this.syncStatus = SYNC_STATUS.FAIL;
    }
  }

  startSync = throttle(async function () {
    this.stopSync();
    this.syncStatus = SYNC_STATUS.BEGIN;
    await this.runDataSyncTick();
  
    this.syncTimer = setInterval(async () => {
      await this.runDataSyncTick()
    }, WEBDAV_MAX_SYNC_INTERVAL);
  }, WEBDAV_MIN_SYNC_INTERVAL)

  tryStartSync() {
    if (isWebDavConfiged()) {
      this.startSync();
    }
  }
}