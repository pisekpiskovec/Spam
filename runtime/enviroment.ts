import {MK_BOOL, MK_NULL, RuntimeValue} from "./values.ts"

export function createGlobalEnvironment(){
  const env = new Enviroment();
  env.declareVariable("true", MK_BOOL(true), true);
  env.declareVariable("false", MK_BOOL(false), true);
  env.declareVariable("null", MK_NULL(), true);
  return env;
}

export default class Enviroment{
  private parent?: Enviroment;
  private variables: Map<string, RuntimeValue>;
  private constants: Set<string>;

  constructor(parentENV?: Enviroment){
    this.parent = parentENV;
    this.variables = new Map();
    this.constants = new Set();
  }

  public declareVariable(varname: string, value: RuntimeValue, constant: boolean): RuntimeValue{
    if (this.variables.has(varname)){
      throw `W: Cannot declare variable ${varname}. ${varname} is already defined`;
    }

    this.variables.set(varname, value);
    if(constant) this.constants.add(varname);
    return value;
  }

  public assignVariable(varname:string, value: RuntimeValue): RuntimeValue{
    const env = this.resolve(varname);
    if(env.constants.has(varname))
      throw `W: Cannot rewrite constant ${varname}`;
    
    env.variables.set(varname, value);
    return value;
  }

  public lookupVariable(varname: string): RuntimeValue{
    const env = this.resolve(varname);
    return env.variables.get(varname) as RuntimeValue;
  }

  public resolve(varname: string): Enviroment{
    if(this.variables.has(varname))
      return this;
    if(this.parent == undefined)
      throw `W: Cannot resolve variable ${varname}. ${varname} does not exist.`;

    return this.parent.resolve(varname);
  }
}
