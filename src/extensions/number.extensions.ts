declare global {
  interface Number {
    round(decimalPlaces?: number): number;
  }
}

Number.prototype.round = function (decimalPlaces: number = 2) {
  const times = Math.pow(10, decimalPlaces);
  const value = this as number;
  return Math.round((value + Number.EPSILON) * times) / times;
};
