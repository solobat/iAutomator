import { createClient } from "webdav/web";
import dayjs from 'dayjs';
import { exportAsJson, importDBFile } from './db.helper';
import { getCuid } from './cuid';

let webDavClient;

interface Config {
  url: string;
  username: string;
  password: string;
}

function configClient(config: Config) {
  const { url, username, password } = config
  const client = createClient(
    url,
    {
      username,
      password,
    }
  );

  return client;
}

const WEBDAV_CONFIG_KEY = 'webdav_config';

function restoreConfig(): Config | null {
  const str = localStorage.getItem(WEBDAV_CONFIG_KEY);

  if (str) {
    try {
      return JSON.parse(str);
    } catch (error) {
      return
    }
  } else {
    return null;
  }
}

export function removeWebDavConfig () {
  localStorage.removeItem(WEBDAV_CONFIG_KEY);
  webDavClient = null;
}

export function getWebDavURL(): string {
  const config = restoreConfig();

  if (config) {
    return config.url 
  } else {
    return ''
  }
}

export function isWebDavConfiged(): boolean {
  const config = restoreConfig();

  if (config) {
    return true
  } else {
    return false;
  }
}

export function saveConfig(config: Config) {
  try {
    localStorage.setItem(WEBDAV_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {

  }
}

const ROOT_PATH: string = '/iHelpers';

export async function initClientWithConfig(config: Config) {
  const client = configClient(config);

  try {
    if (await client.exists(ROOT_PATH) === false) {
      await client.createDirectory(ROOT_PATH);
    }

    webDavClient = client;

    return client;
  } catch (error) {
    return null;
  }
}

async function getClient() {
  if (webDavClient) {
    return webDavClient
  } else {
    const config = restoreConfig();

    if (config) {
      return initClientWithConfig(config);
    } else {
      return Promise.reject('failed to init');
    }
  }
}

function getDataFullFileName() {
  const suffix = dayjs().format('YYYY-MM-DD');

  return `${ROOT_PATH}/ihelpers-export_${suffix}_${getCuid()}.json`
}

export async function saveData() {
  const client = await getClient();

  if (client) {
    try {
      const data = await exportAsJson();
      const name = getDataFullFileName();

      await client.putFileContents(name, data);
    } catch (error) {
      return Promise.reject(error);
    }
  } else {
    return Promise.reject('client init failed...');
  }
}

async function restoreData() {
  const client = await getClient();

  if (client) {
    const files = await client.getDirectoryContents(ROOT_PATH);

    return files || [];
  } else {
    return [];
  }
}

function parseFileName(name = '') {
  const [base, date, cuid] = name.split('.json')[0].split('_');

  return {
    base, date, cuid
  }
}

function isCreatedBy(file) {
  const info = parseFileName(file.basename);

  if (info.cuid === getCuid()) {
    return true;
  } else {
    return false;
  }
}

async function getFileContents(file) {
  return await webDavClient.getFileContents(file.filename, { format: 'binary' });
}

async function renameFileWithCuid(file) {
  await webDavClient.moveFile(file.filename, getDataFullFileName())
}

function sortFiles(files) {
  return files.sort((a, b) => Number(new Date(a.lastmod)) > Number(new Date(b.lastmod)) ? -1 : 1);
}

export async function createDataSyncTick() {
  const files = await restoreData();

  sortFiles(files);
  const latest = files[0];

  if (latest) {
    if (isCreatedBy(latest)) {
      await saveData();

      return false;
    } else {
      const content = await getFileContents(latest)
      const blob = new Blob([content]);

      if (content) {
        await importDBFile(blob)
        await renameFileWithCuid(latest)

        return true;
      } else {
        return false;
      }
    }
  } else {
    await saveData();

    return false;
  }
}