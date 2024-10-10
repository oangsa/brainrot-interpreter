import Parser from "./frontend/parser";
import { evaluate } from "./runtime/interpreter";

repl();

async function repl() {
    const parser = new Parser();

    console.log("\nGen Z Language Repl V 0.1");

    while (true) {

        const input = prompt("> ");

        if (!input || input.includes("exit")) {
            throw("Exit Repl");
        }

        const program = parser.produceAST(input);
        
        // console.log(program)
        
        const result = evaluate(program)
        
        console.log(result)
    }
}