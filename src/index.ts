import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "esbuild";
import type { FileExported } from "./types/exporteds";
import { getDeclarations } from "./utils/getDeclarations";
import { build, getExporteds } from "./utils/getExporteds";

const gasPlugin = (): Plugin => ({
  name: "gas-plugin",
  async setup({ initialOptions, onEnd }) {
    if (initialOptions.format !== "iife") {
      throw new Error(
        "`format` must be set to `iife` for this plugin to work correctly.",
      );
    }
    if (initialOptions.write !== false) {
      throw new Error(
        "`write` must be set to `false` for this plugin to work correctly.",
      );
    }
    if (initialOptions.globalName === undefined) {
      throw new Error(
        "`globalName` must be set for this plugin to work correctly.",
      );
    }

    const result = await build(initialOptions);
    const fileExporteds: FileExported = {};
    for (const file of result.outputFiles ?? []) {
      fileExporteds[file.path] = getExporteds(file.text);
    }

    onEnd((result) => {
      for (const file of result.outputFiles ?? []) {
        const globalAssignments = getDeclarations(
          fileExporteds[file.path],
          initialOptions.globalName ?? "",
          initialOptions.minify,
        );
        fs.mkdirSync(path.dirname(file.path), { recursive: true });
        fs.writeFileSync(file.path, `${file.text + globalAssignments}\n`);
      }
    });
  },
});

export { gasPlugin };
