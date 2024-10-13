type Exported = {
  exportedName: string;
  type: "function" | "variable";
};

type Exporteds = { [key: string]: Exported };

type FileExported = { [key: string]: Exporteds };

export type { Exporteds, FileExported };
