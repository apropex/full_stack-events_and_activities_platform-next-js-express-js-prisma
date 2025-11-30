//

export const TIME_UNIT = {
  s: 1000,
  m: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24,
  w: 1000 * 60 * 60 * 24 * 7,
  M: 1000 * 60 * 60 * 24 * 30,
  y: 1000 * 60 * 60 * 24 * 365,
} as const;

export type TIME_UNIT_KEY = keyof typeof TIME_UNIT;

export const getDuration = (timeUnit: string): number => {
  const match = timeUnit.match(/^(\d+)([a-zA-Z])$/);
  if (!match) throw new Error("Invalid duration");

  const [, num, unit] = match;

  if (!(unit in TIME_UNIT)) {
    throw new Error(`Invalid duration unit: ${unit}`);
  }

  return Number(num) * TIME_UNIT[unit as TIME_UNIT_KEY];
};

export const getSeconds = (timeUnit: string): number => {
  return getDuration(timeUnit) / 1000;
};
