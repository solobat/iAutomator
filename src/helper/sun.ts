import { getSunrise, getSunset } from "sunrise-sunset-js";

function getDayMins(date: Date): number {
  const hours = date.getHours();
  const mins = date.getMinutes();

  return hours * 60 + mins;
}

export function isSunset(lat: number, long: number, date: Date) {
  const ssDate = getSunset(lat, long, date);
  const ssMins = getDayMins(ssDate);
  const mins = getDayMins(date);

  return ssMins <= mins;
}

export function isSunrise(lat: number, long: number, date: Date) {
  const srDate = getSunrise(lat, long, date);
  const srMins = getDayMins(srDate);
  const mins = getDayMins(date);

  return srMins < mins;
}

export function isDark(lat: number, long: number, date = new Date()) {
  return isSunset(lat, long, date) || !isSunrise(lat, long, date);
}
