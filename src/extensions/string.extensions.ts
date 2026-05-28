declare global {
  interface String {
    toCapitalize(): string;
  }
}

String.prototype.toCapitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
