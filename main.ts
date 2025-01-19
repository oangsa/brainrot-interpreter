import Parser from "./frontend/parser";
import Environment from "./runtime/environment";
import {createGlobalEnv} from "./runtime/environment";
import { evaluate } from "./runtime/interpreter";
import { parseArgs } from "util";

const { values, positionals } = parseArgs({
    args: Bun.argv,
    options: {
      file: {
        type: 'string',
      },
    },
    strict: true,
    allowPositionals: true,
});

run(values.file as string);

async function run(filename: string) {
    const parser = new Parser();
    const env = createGlobalEnv();;

    const ipt = Bun.file(filename);
    const txt = await ipt.text()
    const program = parser.produceAST(txt);
    const result = evaluate(program, env)

}

async function repl() {
    const parser = new Parser();
    const env = new Environment();

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
