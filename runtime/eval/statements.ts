import { FunctionDeclaration, Program, VariableDeclaration } from "../../frontend/ast.ts";
import Enviroment from "../enviroment.ts";
import { evaluate } from "../interpreter.ts";
import { FunctionValue, MK_NULL, RuntimeValue } from "../values.ts";

export function evaluateProgram(program: Program, env: Enviroment): RuntimeValue{
  let lastEvaluated: RuntimeValue = MK_NULL();
  for (const statement of program.body){
    lastEvaluated = evaluate(statement, env);
  }
  return lastEvaluated;
}

export function evaluateVariableDeclaration(declaration: VariableDeclaration, env: Enviroment): RuntimeValue{
  const value = declaration.value ? evaluate(declaration.value, env): MK_NULL();
  return env.declareVariable(declaration.identifier, value, declaration.constant);
}

export function evaluateFunctionDeclaration(declaration: FunctionDeclaration, env: Enviroment): RuntimeValue{
  const fnc = {
    type: "function",
    name: declaration.name,
    parameters: declaration.parameters,
    declarationEnvironment: env,
    body: declaration.body,
  } as FunctionValue;
  return env.declareVariable(declaration.name, fnc, true);
}
