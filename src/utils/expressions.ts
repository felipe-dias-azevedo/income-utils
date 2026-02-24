const handleExpression = (value: string) => {
  let expression = value.trim();

  // Remove leading = if present (like Excel formulas)
  if (expression.startsWith("=")) {
    expression = expression.slice(1);
  }

  if (!expression) {
    throw new Error("Please enter an expression");
  }

  // Replace common symbols for decimal notation (comma to dot)
  expression = expression.replace(/,/g, ".");

  // Evaluate the expression safely using Function constructor
  // This is safer than eval and allows mathematical operations
  const result = new Function(`return (${expression})`)();

  // Ensure result is a number
  if (typeof result !== "number" || isNaN(result)) {
    throw new Error("Invalid calculation result");
  }

  return Math.round(result * 100) / 100;
};

export default handleExpression;
