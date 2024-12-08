import parser from "@babel/parser";
import esbuild from "esbuild";
import type { BuildOptions } from "esbuild";
import { traverse } from "../babel/traverse.js";
import type { Exports } from "../types/Exports.js";

export const build = async (initialOptions: BuildOptions) => {
  return await esbuild
    .build({
      ...initialOptions,
      format: "esm",
      minify: false,
      plugins: undefined,
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
};

export const extractExports = (input: string) => {
  const exports: Exports = {};
  const ast = parser.parse(input, { sourceType: "module" });
  traverse(ast, {
    ExportSpecifier(path) {
      if (path.node.exported.type === "Identifier" && path.node.exported.name !== "default") {
        exports[path.node.local.name] = {
          name: path.node.exported.name,
          type: "variable",
        };
      }
    },
  });
  traverse(ast, {
    FunctionDeclaration(path) {
      if (path.node.id && Object.hasOwn(exports, path.node.id.name)) {
        exports[path.node.id.name] = {
          ...exports[path.node.id.name],
          type: "function",
        };
      }
    },
  });
  return exports;
};
