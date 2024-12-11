import Parser from "./frontend/parser.ts";
import { evaluate } from "./runtime/interpreter.ts";

shell();

function shell(){
  const parser = new Parser();
  console.log("\nSpamShell v0.2");
  console.log("Type \"exit exit\" to exit\n");
  while(true){
    const input = prompt("spam");
    if(!input || input.includes("exit exit")){
      Deno.exit(1);
    }

    const program = parser.produceAST(input);
    const result = evaluate(program);
    console.log(result);
  }
}
