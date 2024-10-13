import generator from "@babel/generator";
import parser from "@babel/parser";
import type { Exporteds } from "../types/exporteds";

const getDeclarations = (
  exporteds: Exporteds,
  globalName: string,
  minified?: boolean,
) => {
  const source = Object.values(exporteds)
    .map(({ exportedName }) => `${exportedName}:${globalName}.${exportedName}`)
    .join(",");
  const assignment = `Object.assign(globalThis, {${source}});`;
  const declarations = Object.values(exporteds)
    .map(({ exportedName, type }) =>
      type === "variable"
        ? `var ${exportedName};`
        : `function ${exportedName}(){}`,
    )
    .join("");
  const code = assignment + declarations;
  const ast = parser.parse(code);
  const generatorResult = generator(ast, { minified }, code);
  return generatorResult.code;
};

export { getDeclarations };
