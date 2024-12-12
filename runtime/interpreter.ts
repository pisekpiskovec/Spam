import {RuntimeValue, NumberValue, MK_NULL} from "./values.ts"
import {BinaryExpression, Identifier, NodeType, NumericLiteral, Program, Statement} from "../frontend/ast.ts"
import Enviroment from "./enviroment.ts";

function evaluateProgram(program: Program, env: Enviroment): RuntimeValue{
  let lastEvaluated: RuntimeValue = MK_NULL();
  for (const statement of program.body){
    lastEvaluated = evaluate(statement, env);
  }
  return lastEvaluated;
}

function evaluateNumericExpression(lhs: NumberValue, rhs: NumberValue, opr: string):NumberValue{
  let result: number = 0;
  switch(opr){
    case "+":
      result = lhs.value + rhs.value;
      break;
    case "-":
      result = lhs.value - rhs.value;
      break;
    case "*":
      result = lhs.value * rhs.value;
      break;
    case "/":
      if(rhs.value != 0) result = lhs.value / rhs.value;
      break;
    case "%":
      if(rhs.value != 0) result = lhs.value % rhs.value;
      else result = lhs.value;
      break;
  }
  return {value: result, type: "number"};
}
 
function evaluateBinaryExpression(binop: BinaryExpression, env: Enviroment):RuntimeValue{
  const leftHandSide = evaluate(binop.left, env);
  const rightHandSide = evaluate(binop.right, env);

  if(leftHandSide.type == "number" && rightHandSide.type == "number"){
    return evaluateNumericExpression(leftHandSide as NumberValue, rightHandSide as NumberValue, binop.operator);
  }
  else {
    return MK_NULL();
  }
}

function evaluateIdentifier(ident: Identifier, env: Enviroment): RuntimeValue{
  const val = env.lookupVariable(ident.symbol);
  return val;
}

export function evaluate (astNode: Statement, env: Enviroment): RuntimeValue{
  switch (astNode.kind){
    case "NumericLiteral":
      return { value: ((astNode as NumericLiteral).value), type: "number" } as NumberValue;
    case "BinaryExpr":
      return evaluateBinaryExpression(astNode as BinaryExpression, env);
    case "Program":
      return evaluateProgram(astNode as Program, env);
    case "Identifier":
      return evaluateIdentifier(astNode as Identifier, env);
    default:
      console.error("E: Interpreter: AST Node yet iterpretated!!", astNode);
      Deno.exit(1);
  }
}
