import Parser from "./frontend/parser";
import Environment from "./runtime/environment";
import { evaluate } from "./runtime/interpreter";
import { MK_BOOL, MK_NULL, MK_NUM } from "./runtime/values";

repl();

async function repl() {
    const parser = new Parser();
    const env = new Environment();
    
    env.declareVar('True', MK_BOOL(true), true);
    env.declareVar('False', MK_BOOL(false), true);
    env.declareVar('null', MK_NULL(), true);

    console.log("\nGen Z Language Repl V 0.1");

    while (true) {

        const input = prompt("> ");

        if (!input || input.includes("exit")) {
            throw("Exit Repl");
        }

        const program = parser.produceAST(input);
        
        // console.log(program)
        
        const result = evaluate(program, env)
        
        console.log(result)
    }
}