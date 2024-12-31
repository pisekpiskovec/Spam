// deno-lint-ignore-file no-empty-interface
export type NodeType =
//Statements
 | "Program"
 | "VariableDeclaration"
//Expressions
 | "AssigmentExpr"
 | "MemberExpr"
 | "CallExpr"
//Literals
 | "Property"
 | "ObjectLiteral"
 | "NumericLiteral"
 | "Identifier"
 | "BinaryExpr";

export interface Statement {
  kind: NodeType;
}

export interface Program extends Statement {
  kind: "Program";
  body: Statement[];
}

export interface VariableDeclaration extends Statement {
  kind: "VariableDeclaration";
  constant: boolean;
  identifier: string;
  value?: Expression;
}

export interface Expression extends Statement {}
export interface AssigmentExpression extends Expression{
  kind: "AssigmentExpr";
  assigne: Expression;
  value: Expression;
}

export interface BinaryExpression extends Expression{
  kind: "BinaryExpr";
  left: Expression;
  right: Expression;
  operator: string;
}

export interface CallExpression extends Expression{
  kind: "CallExpr";
  args: Expression[];
  caller: Expression;
}

export interface MemberExpression extends Expression{
  kind: "MemberExpr";
  object: Expression;
  property: Expression;
  computed: boolean;
}

export interface Identifier extends Expression{
  kind: "Identifier";
  symbol: string;
}

export interface NumericLiteral extends Expression{
  kind: "NumericLiteral";
  value: number;
}

export interface Property extends Expression{
  kind: "Property";
  key: string;
  value?: Expression;
}

export interface ObjectLiteral extends Expression{
  kind: "ObjectLiteral";
  properties: Property[];
}
