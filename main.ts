import Parser from "./frontend/parser.ts";
import Enviroment from "./runtime/enviroment.ts";
import { evaluate } from "./runtime/interpreter.ts";
import { MK_BOOL, MK_NULL, MK_NUMBER, NumberValue } from "./runtime/values.ts";

shell();

function shell(){
  const parser = new Parser();
  const env = new Enviroment();
  env.declareVariable("x", MK_NUMBER(100));
  env.declareVariable("true", MK_BOOL(true));
  env.declareVariable("false", MK_BOOL(false));
  env.declareVariable("null", MK_NULL());
  console.log("\nSpamShell v0.2");
  console.log("Type \"exit exit\" to exit\n");
  while(true){
    const input = prompt("spam");
    if(!input || input.includes("exit exit")){
      Deno.exit(1);
    }

    const program = parser.produceAST(input);
    const result = evaluate(program, env);
    console.log(result);
  }
}
