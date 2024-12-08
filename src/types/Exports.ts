type Export = {
  name: string;
  type: "function" | "variable";
};

type Exports = { [key: string]: Export };

export type { Exports };
