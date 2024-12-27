import {RuntimeValue, NumberValue} from "./values.ts"
import {AssigmentExpression, BinaryExpression, Identifier, NumericLiteral, ObjectLiteral, Program, Statement, VariableDeclaration} from "../frontend/ast.ts"
import Enviroment from "./enviroment.ts";
import {evaluateAssigment, evaluateBinaryExpression, evaluateIdentifier, evaluateObjectExpression} from "./eval/expressions.ts"
import {evaluateProgram, evaluateVariableDeclaration} from "./eval/statements.ts"

export function evaluate (astNode: Statement, env: Enviroment): RuntimeValue{
  switch (astNode.kind){
    case "NumericLiteral":
      return { value: ((astNode as NumericLiteral).value), type: "number" } as NumberValue;
    case "Identifier":
      return evaluateIdentifier(astNode as Identifier, env);
    case "ObjectLiteral":
      return evaluateObjectExpression(astNode as ObjectLiteral, env)
    case "AssigmentExpr":
      return evaluateAssigment(astNode as AssigmentExpression, env);
    case "BinaryExpr":
      return evaluateBinaryExpression(astNode as BinaryExpression, env);
    case "Program":
      return evaluateProgram(astNode as Program, env);
    case "VariableDeclaration":
      return evaluateVariableDeclaration(astNode as VariableDeclaration, env);
    default:
      console.error("E: Interpreter: AST Node yet iterpretated!!", astNode);
      Deno.exit(0);
  }
}
