import {RuntimeValue} from "./values.ts"

export default class Enviroment{
  private parent?: Enviroment;
  private variables: Map<string, RuntimeValue>

  constructor(parentENV?: Enviroment){
    this.parent = parentENV;
    this.variables = new Map();
  }

  public declareVariable(varname: string, value: RuntimeValue): RuntimeValue{
    if (this.variables.has(varname)){
      throw `W: Cannot declare variable ${varname}. ${varname} is already defined`;
    }

    this.variables.set(varname, value);
    return value;
  }

  public assignVariable(varname:string, value: RuntimeValue): RuntimeValue{
    const env = this.resolve(varname);
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
