import Environment from "./enviroment.ts";
export type ValueType = "null" | "number" | "boolean" | "object" | "nativeFnc";

export interface RuntimeValue {
  type: ValueType;
}

export interface NullValue extends RuntimeValue {
  type: "null";
  value: 0;
}

export interface NumberValue extends RuntimeValue {
  type: "number";
  value: number;
}

export function MK_NUMBER(n = 0){
  return {type: "number", value: n} as NumberValue;
}

export function MK_NULL(){
  return {type: "null", value: 0} as NullValue;
}

export interface BooleanValue extends RuntimeValue {
  type: "boolean";
  value: boolean;
}

export function MK_BOOL(b?: boolean){
  if(b === undefined)
    return {type: "boolean", value: Math.random() > 0.5} as BooleanValue;
  else
    return {type: "boolean", value: b} as BooleanValue;
}

export interface ObjectValue extends RuntimeValue {
  type: "object";
  properties: Map<string, RuntimeValue>;
}

export type FunctionCall = (args: RuntimeValue[], env: Environment) => RuntimeValue;

export interface NativeFncValue extends RuntimeValue {
  type: "nativeFnc";
  call: FunctionCall;
}

export function MK_NATIVE_FNC(call: FunctionCall){
  return { type: "nativeFnc", call } as NativeFncValue;
}
