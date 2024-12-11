import Parser from "./frontend/parser.ts";

shell();

function shell(){
  const parser = new Parser();
  console.log("\nSpamShell v0.1");
  console.log("Type \"exit exit\" to exit");
  while(true){
    const input = prompt("spam");
    if(!input || input.includes("exit exit")){
      Deno.exit(1);
    }

    const program = parser.produceAST(input);
    console.log(program);
  }
}
