import { RuntimeValue } from './values'

export default class Environment {

    private parent?: Environment;
    private  variables: Map<string, RuntimeValue>
    private  constants: Set<string>

    constructor (parentENV?: Environment) {
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

    public resolve(varName: string): Environment {
        if (this.variables.has(varName)) return this;

        if (this.parent == undefined) {
            throw `Skibidi dom dom yes yes. Don't you have eyes?\nUncaught Error: 'Variable named '${varName}' does not exist.'`
        }

        return this.parent.resolve(varName);
    }

}