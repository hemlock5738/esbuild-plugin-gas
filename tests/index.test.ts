import fs from "node:fs";
import { dirname, join } from "node:path";
import esbuild, { BuildOptions } from "esbuild";
import { rimrafSync } from "rimraf";
import { afterAll, describe, expect, it } from "vitest";
import { gasPlugin } from "../src/index";

describe("index", () => {
  const fixturesDir = join(import.meta.dirname, "./fixtures/");
  const outfile = join(fixturesDir, "dist/index.js");

  const build = async () => {
    await esbuild
      .build({
        bundle: true,
        entryPoints: [join(fixturesDir, "src/index.js")],
        format: "iife",
        globalName: "_",
        outfile,
        plugins: [gasPlugin()],
        write: false,
      })
      .catch((e) => {
        console.error(e);
        process.exit(1);
      });
  };

  const getDeclarations = () => {
    const output = fs.readFileSync(outfile, { encoding: "utf-8" });
    const re = /Object.assign\(globalThis,[\s\S]*/;
    const match = output.match(re);
    return match?.[0];
  };

  const getExpectedDeclarations = () => {
    const path = join(fixturesDir, "./expected/declarations.js");
    const expected = fs.readFileSync(path, { encoding: "utf8" });
    return expected;
  };

  afterAll(() => {
    rimrafSync(dirname(outfile));
  });

  it("default", async () => {
    await build();
    expect(getDeclarations()).toBe(getExpectedDeclarations());
  });
});
