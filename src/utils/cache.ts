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
