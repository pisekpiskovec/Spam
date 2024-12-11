import {RuntimeValue, NumberValue, NullValue} from "./values.ts"
import {BinaryExpression, NodeType, NumericLiteral, Program, Statement} from "../frontend/ast.ts"

function evaluateProgram(program: Program): RuntimeValue{
  let lastEvaluated: RuntimeValue = { type: "null", value: "null"} as NullValue;
  for (const statement of program.body){
    lastEvaluated = evaluate(statement);
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
 
function evaluateBinaryExpression(binop: BinaryExpression):RuntimeValue{
  const leftHandSide = evaluate(binop.left);
  const rightHandSide = evaluate(binop.right);

  if(leftHandSide.type == "number" && rightHandSide.type == "number"){
    return evaluateNumericExpression(leftHandSide as NumberValue, rightHandSide as NumberValue, binop.operator);
  }
  else {
    return {type: "null", value: "null"} as NullValue;
  }
}

export function evaluate (astNode: Statement): RuntimeValue{
  switch (astNode.kind){
    case "NumericLiteral":
      return { value: ((astNode as NumericLiteral).value), type: "number" } as NumberValue;
    case "NullLiteral":
      return { value: "null", type: "null"} as NullValue;
    case "BinaryExpr":
      return evaluateBinaryExpression(astNode as BinaryExpression);
    case "Program":
      return evaluateProgram(astNode as Program);
    // case "Identifier":
    default:
      console.error("E: Interpreter: AST Node yet iterpretated!!", astNode);
      Deno.exit(1);
  }
}
