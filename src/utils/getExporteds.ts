import parser from "@babel/parser";
import traverse from "@babel/traverse";
import esbuild from "esbuild";
import type { BuildOptions } from "esbuild";
import type { Exporteds } from "../types/exporteds";

const build = async (initialOptions: BuildOptions) => {
  try {
    const result = await esbuild.build({
      ...initialOptions,
      format: "esm",
      minify: false,
      plugins: undefined,
    });
    return result;
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

const getExporteds = (input: string) => {
  const exporteds: Exporteds = {};
  const ast = parser.parse(input, { sourceType: "module" });
  traverse(ast, {
    ExportSpecifier(path) {
      if (
        path.node.exported.type === "Identifier" &&
        path.node.exported.name !== "default"
      ) {
        exporteds[path.node.local.name] = {
          exportedName: path.node.exported.name,
          type: "variable",
        };
      }
    },
  });
  traverse(ast, {
    FunctionDeclaration(path) {
      if (path.node.id && Object.hasOwn(exporteds, path.node.id.name)) {
        exporteds[path.node.id.name] = {
          ...exporteds[path.node.id.name],
          type: "function",
        };
      }
    },
  });
  return exporteds;
};

export { build, getExporteds };
