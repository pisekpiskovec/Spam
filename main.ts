import Parser from "./frontend/parser.ts";
import Enviroment, { createGlobalEnvironment } from "./runtime/enviroment.ts";
import { evaluate } from "./runtime/interpreter.ts";

// shell();
run("test.spam");

async function run(filename:string){
  const parser = new Parser();
  const env = createGlobalEnvironment();

  const input = await Deno.readTextFile(filename);
  const program = parser.produceAST(input);
  const result = evaluate(program, env);
  console.log(result);
}

function shell(){
  const parser = new Parser();
  const env = createGlobalEnvironment();

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
