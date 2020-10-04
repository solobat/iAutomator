import { throttle } from "lodash";
import { SYNC_STATUS, WEBDAV_MAX_SYNC_INTERVAL, WEBDAV_MIN_SYNC_INTERVAL } from "../common/const";
import { SimpleEvent } from "../utils/event";
import { tuple } from "../utils/types";
import { onDbUpdate } from "./db.helper";
import { createDataSyncTick, isWebDavConfiged } from "./webdav";

const EventTypes = tuple('received', 'uploaded')

export type EventType = (typeof EventTypes)[number]

export default class Sync extends SimpleEvent<EventType> {
  syncStatus;
  syncTimer = 0;

  constructor() {
    super();
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
      const newReceived = await createDataSyncTick();
  
      if (newReceived) {
        this.emit('received');
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