import { getSunrise, getSunset } from 'sunrise-sunset-js';

export function isSunset(lat: number, long: number) {
  const ssDate = getSunset(lat, long)
  const res = Number(ssDate) <= Number(new Date())

  return res
}