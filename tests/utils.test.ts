import fs from "node:fs";
import { dirname, join } from "node:path";
import { rimrafSync } from "rimraf";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getDeclarations } from "../src/utils/getDeclarations";
import { build, getExporteds } from "../src/utils/getExporteds";

describe("utils", () => {
  const fixturesDir = join(import.meta.dirname, "./fixtures/");
  const outfile = join(fixturesDir, "./dist/utils.js");
  const expectedExporteds = JSON.parse(
    fs.readFileSync(join(fixturesDir, "./expected/exporteds.json"), "utf-8"),
  );

  beforeAll(async () => {
    await build({
      bundle: true,
      entryPoints: [join(fixturesDir, "./src/index.ts")],
      format: "esm",
      outfile,
    }).catch((e) => {
      console.error(e);
      process.exit(1);
    });
  });

  afterAll(() => {
    rimrafSync(dirname(outfile));
  });

  it("getExporteds", async () => {
    const output = fs.readFileSync(outfile, "utf-8");
    const exporteds = getExporteds(output);
    expect(exporteds).toEqual(expectedExporteds);
  });

  it("getDeclarations", () => {
    const declarations = getDeclarations(expectedExporteds, "_");
    const expectedDeclarations = fs.readFileSync(
      join(fixturesDir, "./expected/declarations.js"),
      "utf-8",
    );
    expect(declarations).toBe(expectedDeclarations.trim());
  });
});
