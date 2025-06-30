export function roundWithPrecision(number: number, precision: number) {
  const factor = Math.pow(10, precision);

  return Math.round((number + Number.EPSILON) * factor) / factor;
}
