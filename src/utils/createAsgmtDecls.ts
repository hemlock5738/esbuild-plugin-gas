import t from "@babel/types";
import { generator } from "../babel/generator.js";
import type { Exports } from "../types/Exports.js";

export const createAsgmtDecls = (exports: Exports, globalName: string, minified?: boolean) => {
  const assignment = t.expressionStatement(
    t.callExpression(t.memberExpression(t.identifier("Object"), t.identifier("assign")), [
      t.identifier("globalThis"),
      t.objectExpression(
        Object.values(exports).map(({ name }) =>
          t.objectProperty(t.identifier(name), t.memberExpression(t.identifier(globalName), t.identifier(name))),
        ),
      ),
    ]),
  );
  const declarations = Object.values(exports).map(({ name, type }) =>
    type === "variable"
      ? t.variableDeclaration("var", [t.variableDeclarator(t.identifier(name))])
      : t.functionDeclaration(t.identifier(name), [], t.blockStatement([])),
  );
  const ast = t.program([assignment, ...declarations]);
  const generatorResult = generator(ast, { minified });
  return generatorResult.code;
};
