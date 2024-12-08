import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "esbuild";
import type { Exports } from "./types/Exports.js";
import { createAsgmtDecls } from "./utils/createAsgmtDecls.js";
import { build, extractExports } from "./utils/extractExports.js";

export const gasPlugin = (): Plugin => ({
  name: "gas-plugin",
  async setup({ initialOptions, onEnd }) {
    if (initialOptions.format !== "iife") {
      throw new Error("`format` must be set to `iife` for this plugin to work correctly.");
    }
    if (initialOptions.globalName === undefined) {
      throw new Error("`globalName` must be set for this plugin to work correctly.");
    }
    if (initialOptions.write !== false) {
      throw new Error("`write` must be set to `false` for this plugin to work correctly.");
    }

    const result = await build(initialOptions);
    const fileExporteds: { [key: string]: Exports } = {};
    for (const file of result.outputFiles ?? []) {
      fileExporteds[file.path] = extractExports(file.text);
    }

    onEnd((result) => {
      for (const file of result.outputFiles ?? []) {
        const globalAssignments = createAsgmtDecls(
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
