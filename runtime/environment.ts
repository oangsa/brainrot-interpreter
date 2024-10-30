import { Identifier, MemberExpr } from '../frontend/ast';
import { MK_BOOL, MK_INTERNAL_FN, MK_NULL, MK_NUM, MK_STR, ObjectValue, RuntimeValue, StringValue } from './values'

export function createGlobalEnv(): Environment {
    const env = new Environment ()

    env.declareVar('True', MK_BOOL(true), true);
    env.declareVar('False', MK_BOOL(false), true);
    env.declareVar('null', MK_NULL(), true);

    // Define Internal Fn
    env.declareVar("yell", MK_INTERNAL_FN((args, _scope) => {
        let newObj = {};
        for (const arg of args) {
            if (arg.type === "object") {
                console.log((arg as ObjectValue).properties);
            }
            else {
                // Just use string value as a temp to prevent error
                console.log((arg as StringValue).value)
            }
        }
        return MK_NULL();
    }), true)

    env.declareVar("yeet", MK_INTERNAL_FN((args, _scope) => {
        if (args.length > 1) throw `Skibidi dom dom yes yes.\n[Value Error] Function named 'yeet' only take 1 argument.`

        for (const arg of args) {
            throw((arg as StringValue).value);
        }
        return MK_NULL();
    }), true)

    function typeofFunc(_args: RuntimeValue[], _env: Environment) { return MK_STR(_args[0].type) }
    env.declareVar("typeof", MK_INTERNAL_FN(typeofFunc), true)


    function timeFunc(_args: RuntimeValue[], _env: Environment) { return MK_NUM(Date.now()) }
    env.declareVar("getCurtime", MK_INTERNAL_FN(timeFunc), true)

    return env
}

export default class Environment {

    private parent?: Environment;
    private variables: Map<string, RuntimeValue>
    private constants: Set<string>

    constructor (parentENV?: Environment) {
        const global = parentENV? true : false
        this.parent = parentENV;
        this.variables = new Map();
        this.constants = new Set();
    }

    public declareVar(varName: string, value: RuntimeValue, isConstant: boolean): RuntimeValue {
        if (this.variables.has(varName)) {
            throw `Skibidi dom dom yes yes. Can't you remember?\nUncaught Error: Variable named '${varName}' is already defined.`
        }

        if (isConstant) this.constants.add(varName);

        this.variables.set(varName, value);

        return value;
    }

    public assignVar(varName: string, value: RuntimeValue): RuntimeValue {
        const env = this.resolve(varName);

        // Check if the var is constant
        if (env.constants.has(varName)) {
            throw `You are sooooooo freaking skibidi.\Uncaught Error: 'Cannot reasign to variable named '${varName}' as it was declare as a constant!'`
        }

        env.variables.set(varName, value);

        return value;
    }

    public lookFor(varName: string): RuntimeValue {
        const env = this.resolve(varName);

        return env.variables.get(varName) as RuntimeValue;
    }

    public lookObj(expr: MemberExpr, value?: RuntimeValue, key?: Identifier): RuntimeValue {
        let pVal;
        if (expr.object.kind === "MemberExpr") {
            pVal = this.lookObj(expr.object as MemberExpr, null, (expr.object as MemberExpr).property as Identifier)
        }
        else {
            
            const varName = (expr.object as Identifier).symbol; // Grab the name
            
            const env = this.resolve(varName);
            
            pVal = env.variables.get(varName);
        }

        const currentProp = (expr.property as Identifier).symbol;
        
        const prop = key ? key.symbol : currentProp;

        if (value) (pVal as ObjectValue).properties.set(prop, value);

        if (currentProp) pVal = ((pVal as ObjectValue).properties.get(currentProp) as ObjectValue);

        return pVal;
    }

    public resolve(varName: string): Environment {
        if (this.variables.has(varName)) return this;

        if (this.parent == undefined) {
            throw `Skibidi dom dom yes yes. Don't you have eyes?\nUncaught Error: 'Variable named '${varName}' does not exist.'`
        }

        return this.parent.resolve(varName);
    }

}