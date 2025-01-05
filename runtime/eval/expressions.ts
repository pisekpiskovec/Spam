import { AssigmentExpression, BinaryExpression, CallExpression, Identifier, ObjectLiteral } from "../../frontend/ast.ts";
import Enviroment from "../enviroment.ts";
import { evaluate } from "../interpreter.ts";
import { FunctionValue, MK_NULL, NativeFncValue, NumberValue, ObjectValue, RuntimeValue } from "../values.ts";

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

export function evaluateAssigment(node: AssigmentExpression, env: Enviroment): RuntimeValue{
  if(node.assigne.kind !== "Identifier") throw `E: Invalid left hand assigment expression ${JSON.stringify(node.assigne)}!!!`;

  const varname = (node.assigne as Identifier).symbol;
  return env.assignVariable(varname, evaluate(node.value, env));
}

export function evaluateObjectExpression(obj: ObjectLiteral, env: Enviroment): RuntimeValue{
  const object = {type: "object", properties: new Map()} as ObjectValue
  for(const {key, value} of obj.properties){
    const runtimeVal = (value == undefined) ? env.lookupVariable(key) : evaluate(value, env);
    object.properties.set(key, runtimeVal)
  }
  return object;
}

export function evaluateCallExpression(expr: CallExpression, env: Enviroment): RuntimeValue{
  const args = expr.args.map((arg) => evaluate(arg, env));
  const fn = evaluate(expr.caller, env);

  if(fn.type == "nativeFnc"){
    const result = (fn as NativeFncValue).call(args, env);
    return result;
  }
  
  if (fn.type == "function"){
    const fnc = fn as FunctionValue;
    const scope = new Enviroment(fnc.declarationEnvironment);
    //Create the vars for parameters list
    for(let i = 0; i < fnc.parameters.length; i++){
      const varname = fnc.parameters[i];
      scope.declareVariable(varname,args[i], false);
    }
    let result:RuntimeValue = MK_NULL();
    for(const stmt of fnc.body) result = evaluate(stmt, scope);
    return result;
  }

  throw "E: Cannot call value that isnt a function: " + JSON.stringify(fn);
}
