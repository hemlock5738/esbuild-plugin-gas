import _traverse from "@babel/traverse";
export const traverse = typeof _traverse === "function" ? _traverse : _traverse.default;
