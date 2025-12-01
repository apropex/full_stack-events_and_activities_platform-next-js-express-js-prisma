//

const letters = ["Z", "B", "K", "X", "O", "R", "C", "Q", "M", "J"];

export const generateTrxID = (): string => {
  const digits = Date.now().toString().split("").map(Number);
  const random = digits.map((d) => letters[d]);

  const partA = `${random.slice(0, 5).join("")}-${random.slice(5).join("")}`;
  const partB = Math.random().toString(36).toUpperCase().slice(2, 8);

  return `TRX-${partA}-${partB}`;
};

//* output: TRX-BQRXR-OMXCZQQM-Q7343B
