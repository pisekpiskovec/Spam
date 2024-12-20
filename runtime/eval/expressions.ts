import { BinaryExpression, Identifier } from "../../frontend/ast.ts";
import Enviroment from "../enviroment.ts";
import { evaluate } from "../interpreter.ts";
import { MK_NULL, NumberValue, RuntimeValue } from "../values.ts";

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
 
export function evaluateBinaryExpression(binop: BinaryExpression, env: Enviroment):RuntimeValue{
  const leftHandSide = evaluate(binop.left, env);
  const rightHandSide = evaluate(binop.right, env);

  if(leftHandSide.type == "number" && rightHandSide.type == "number"){
    return evaluateNumericExpression(leftHandSide as NumberValue, rightHandSide as NumberValue, binop.operator);
  }
  else {
    return MK_NULL();
  }
}

export function evaluateIdentifier(ident: Identifier, env: Enviroment): RuntimeValue{
  const val = env.lookupVariable(ident.symbol);
  return val;
}
