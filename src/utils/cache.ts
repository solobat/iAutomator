export function CacheUtil<T>() {
  const caches: Array<[string, T]> = [];

  const getCache = (key: string) => {
    const item = caches.find((item) => item[0] === key);

    return {
      value: item ? item[1] : null,
      update: (data: T) => {
        item[1] = data;
      },
    };
  };
  const addCache = (script: string, data: T) => caches.push([script, data]);

  const put = (key: string, data: T) => {
    const cache = getCache(key);
    if (cache.value) {
      cache.update(data);
    } else {
      addCache(key, data);
    }
  };

  return {
    get: getCache,
    put,
  };
}

function shouldCache<T>(res: T) {
  return res != null || (Array.isArray(res) && res.length > 0);
}

export function withCache<T>(
  fn: (key: string) => T,
  options = { shouldCache }
) {
  const cacheUtil = CacheUtil<T>();

  return function (key: string) {
    const cache = cacheUtil.get(key);
    if (cache.value) {
      return cache.value;
    }

    const res = fn(key);

    if (options.shouldCache(res)) {
      cacheUtil.put(key, res);
    }

    return res;
  };
}
