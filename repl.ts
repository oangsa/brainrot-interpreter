import Parser from "./frontend/parser";
import {createGlobalEnv} from "./runtime/environment";
import { evaluate } from "./runtime/interpreter";

async function repl() {
    const parser = new Parser();
    const env = createGlobalEnv();

    console.log("\nGen Z Language Repl V 0.1");

    while (true) {

        const input = prompt("> ");

        if (!input || input.includes("exit")) {
            throw("Exit Repl");
        }

        const program = parser.produceAST(input);

        const result = evaluate(program, env)

        console.log(result);

    }
}

repl();
