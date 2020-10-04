import { throttle } from "lodash";
import { STORAGE_KEYS, SYNC_STATUS, WEBDAV_MAX_SYNC_INTERVAL, WEBDAV_MIN_SYNC_INTERVAL } from "../common/const";
import { SimpleEvent } from "../utils/event";
import { tuple } from "../utils/types";
import { onDbUpdate } from "./db.helper";
import { createDataSyncTick, isWebDavConfiged } from "./webdav";

const EventTypes = tuple('received', 'uploaded')

export type EventType = (typeof EventTypes)[number]

export function isAutoSync() {
  const autoSync = Number(localStorage.getItem(STORAGE_KEYS.AUTO_SYNC) || 1)

  return autoSync === 1
}

export default class Sync extends SimpleEvent<EventType> {
  syncStatus;
  syncTimer = 0;

  constructor() {
    super();
    this.tryStartSync();
    this.setupAutoSync();
  }

  setupAutoSync() {
    onDbUpdate(() => {
      if (isAutoSync()) {
        this.tryStartSync();
      }
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

  private getSyncInterval() {
    const cached = localStorage.getItem(STORAGE_KEYS.SYNC_INTERVAL);
    const interval = Number(cached) || WEBDAV_MAX_SYNC_INTERVAL;

    return interval;
  }

  startSync = throttle(async function (this: Sync) {
    this.stopSync();
    this.syncStatus = SYNC_STATUS.BEGIN;
    await this.runDataSyncTick();
  
    const inerval = this.getSyncInterval();

    this.syncTimer = setInterval(async () => {
      await this.runDataSyncTick()
    }, inerval);
  }, WEBDAV_MIN_SYNC_INTERVAL)

  tryStartSync() {
    if (isWebDavConfiged()) {
      this.startSync();
    }
  }
}