import fs from "node:fs";
import { dirname, join } from "node:path";
import parser from "@babel/parser";
import type { Statement } from "@babel/types";
import esbuild from "esbuild";
import { expect, it } from "vitest";
import { traverse } from "../src/babel/traverse.js";
import { gasPlugin } from "../src/index.js";

it("should contain global assignment and declarations.", async () => {
  const globalName = "_";
  const srcfile = join(import.meta.dirname, "src/index.ts");
  const outfile = join(import.meta.dirname, "dist/index.js");

  const getBuildResult = async () => {
    await esbuild
      .build({
        bundle: true,
        entryPoints: [srcfile],
        format: "iife",
        globalName,
        outfile,
        plugins: [gasPlugin()],
        write: false,
      })
      .catch((e) => {
        console.error(e);
        process.exit(1);
      });
    const result = fs.readFileSync(outfile, { encoding: "utf-8" });
    fs.rmSync(dirname(outfile), { recursive: true, force: true });
    return result;
  };

  const checkVariable = (variable: Statement) => {
    if (variable.type === "VariableDeclaration") {
      if (variable.declarations.length === 1) {
        expect(variable.declarations[0].id.loc?.identifierName).toBe(globalName);
      }
    }
  };

  const checkAssignment = (assignment: Statement) => {
    const expectation = {
      add: `${globalName}.add`,
      divide: `${globalName}.divide`,
      modulo: `${globalName}.modulo`,
      mul: `${globalName}.mul`,
      sub: `${globalName}.sub`,
    };
    if (assignment.type === "ExpressionStatement") {
      if (assignment.expression.type === "CallExpression") {
        const callee = assignment.expression.callee;
        if (callee.type === "MemberExpression") {
          expect(callee.object.loc?.identifierName).toBe("Object");
          expect(callee.property.loc?.identifierName).toBe("assign");
        }
        expect(assignment.expression.arguments.length).toBe(2);
        const [globalThis_, object] = assignment.expression.arguments;
        expect(globalThis_.loc?.identifierName).toBe("globalThis");
        const args: { [key: string]: string | null | undefined } = {};
        if (object.type === "ObjectExpression") {
          for (const prop of object.properties) {
            if (prop.type === "ObjectProperty") {
              if (prop.value.type === "MemberExpression") {
                args[prop.key.loc?.identifierName ?? ""] =
                  `${prop.value.object.loc?.identifierName}.${prop.value.property.loc?.identifierName}`;
              }
            }
          }
        }
        expect(args).toEqual(expectation);
      }
    }
  };

  const checkDeclarations = (declarations: Statement[]) => {
    const expectation = {
      add: "function",
      divide: "var",
      modulo: "var",
      mul: "function",
      sub: "var",
    };
    const decls: { [key: string]: string | null | undefined } = {};
    for (const decl of declarations) {
      if (decl.type === "VariableDeclaration") {
        if (decl.declarations.length === 1) {
          decls[decl.declarations[0].id.loc?.identifierName ?? ""] = decl.kind;
        }
      }
      if (decl.type === "FunctionDeclaration") {
        if (decl.body.body.length === 0) {
          decls[decl.id?.loc?.identifierName ?? ""] = "function";
        }
      }
    }
    expect(decls).toEqual(expectation);
  };

  const checkAll = (output: string) => {
    const ast = parser.parse(output);
    traverse(ast, {
      Program(path) {
        const [variable, assignment, ...declarations] = path.node.body;
        checkVariable(variable);
        checkAssignment(assignment);
        checkDeclarations(declarations);
      },
    });
  };

  const output = await getBuildResult();
  checkAll(output);
});
