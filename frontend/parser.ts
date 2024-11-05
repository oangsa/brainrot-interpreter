import { Statement, Program, Expr, BinaryExpr, NumericLiteral, Identifier, VarDeclaration, AssignmentExpr, Property, ObjectLiteral, CallExpr, MemberExpr, StringLiteral, FunctionDeclaration } from "./ast";
import { tokenize, Token, TokenType } from './lexer';

export default class Parser {
    private tokens: Token[] = [];
    
    private isEOF(): boolean {
        return this.tokens[0].type == TokenType.EOF;
    }

    private at() {
        return this.tokens[0] as Token;
    }

    private eat() {
        const prev = this.tokens.shift() as Token;
        return prev;
    }

    private expect(types: Token[], err: any) {
        const prev = this.tokens.shift() as Token;

        let Types: Array<any> = [];
        let val: string = "";
        let ctr: number = 0;
        let f: boolean = false;
        
        types.forEach((t) => {
            Types.push(t.type);
            val += t.value;
            if (types.length > 1 && ctr < types.length - 1) {
                val += " | ";
                ctr++;
            }
        });

        if (prev.type == TokenType.Quote && Types.includes(TokenType.Semicolon)) err = "String declaration must start with qoute or double qoute."; f = true

        if (!prev || !Types.includes(prev.type)) {
                throw(`You are too skibidi for this language. Like FR dude?\n[Parsing Error] ${err}\n- Got: '${(!f) ? prev.value : ""}'\n- Expecting: '${(!f) ? val : '"'}'`)
        }

        return prev;
    }

    private parse_stmt (): Statement {
        // Skip to parse_expr
        switch (this.at().type) {

            case TokenType.Var:
            case TokenType.Const:
                return this.parse_var_declaration();
            
            case TokenType.Fn:
                return this.parse_fn_declaration();

            default: 
                return this.parse_expr();
        }
        // return this.parse_expr();
    }

    private parse_fn_declaration(): Statement {
        this.eat(); // Just pass the fn (cooking) keywords
        const name = this.expect([{value: "Function name", type: TokenType.Identifier}], "Invalid function declaration!").value;

        const args = this.parse_args();
        const params: string[] = [];
        for (const arg of args) {
            if (arg.kind !== "Identifier") {
                throw `You have no part of symphony 🐬🐬\n[Parsing Error] Function params must be string!`
            }

            params.push((arg as Identifier).symbol)
        }

        this.expect([{value: "{", type: TokenType.OpenBrace}], "Invalid function declaration!")
    
        const body: Statement[] = [];

        while (this.at().type != TokenType.EOF && this.at().type != TokenType.CloseBrace) {
            body.push(this.parse_stmt());
        }

        this.expect([{value: "}", type: TokenType.CloseBrace}], "Invalid function declaration!");

        const fn = {
            body, 
            name, 
            params, 
            kind: "FunctionDeclaration"
        } as FunctionDeclaration

        return fn;
    }

    private parse_var_declaration(): Statement {
        const isConstant = this.eat().type == TokenType.Const;

        const ident = this.expect([{value: "sigma", type: TokenType.Identifier}, {value: "beta", type: TokenType.Identifier}], "Unexpected token found!").value;

        if ( this.at().type == TokenType.Semicolon ) {
            this.eat();
            if (isConstant) {
                throw `Uncaught "Must assign value to CONST variable to decalre."`;
            }

            return { kind: "VariableDeclaration", identifier: ident, isConstant: false, value: undefined } as VarDeclaration;
        }

        this.expect([{value: "=", type: TokenType.Equals}], "Unexpected token found!");
        
        const declaration = { kind: "VariableDeclaration", isConstant: isConstant, value: this.parse_expr(), identifier: ident } as VarDeclaration;

        this.expect([{value: ";", type: TokenType.Semicolon}], "Unexpected token found! 'Variable declaration must end with semicolon.'");
    
        return declaration;
    }

    private parse_assignment_expr(): Expr {
        const left = this.parse_object_expr();

        if (this.at().type == TokenType.Equals) {
            this.eat(); // Just pass the equal sign;
            const value = this.parse_assignment_expr();
            return {value, assigne: left, kind: "AssignmentExpr"} as AssignmentExpr

        }

        return left;
    }
    
    private parse_expr(): Expr {
        return  this.parse_assignment_expr();
    }

    private parse_str_expr(): Expr {
        this.eat();
        let str: string = ""

        while (!this.isEOF() && this.at().type != TokenType.Quote) {
            str += this.at().value
            this.eat();
        }

        const strVal: Expr = {
            kind: "StringLiteral",
            value: str
        } as StringLiteral
        
        this.expect([{value: '"', type: TokenType.Quote}], "String declaration must end with qoute or double qoute.")
        

        return strVal;
    }
    
    private parse_additive_expr(): Expr {

        let lhs = this.parse_multiplicitive_expr();

        while ( this.at().value == "+" || this.at().value == "-") {
            const operator = this.eat().value;
            const rhs = this.parse_multiplicitive_expr();
            lhs = {
                kind: "BinaryExpr",
                lhs,
                rhs,
                operator
            } as BinaryExpr
        }
        // console.log(lhs);
        // console.log("--------");
        return lhs;
    }

    private parse_multiplicitive_expr(): Expr {
        let lhs = this.parse_call_member_expr();
        
        while ( this.at().value == "/" || this.at().value == "*" || this.at().value == "%") {
            const operator = this.eat().value;
            const rhs = this.parse_call_member_expr();
            lhs = {
                kind: "BinaryExpr",
                lhs,
                rhs,
                operator
            } as BinaryExpr
        }

        return lhs;
    }

    private parse_object_expr(): Expr {
        // Expect { Prop[] }

        if (this.at().type !== TokenType.OpenBrace) {
            if (this.at().type == TokenType.Quote) {
                return this.parse_str_expr();
            } 

            return this.parse_additive_expr();
        }

        this.eat(); // Pass '{'
        const properties: Array<Property> = new Array<Property>();

        while (!this.isEOF() && this.at().type != TokenType.CloseBrace) {
            // 3 Cases to handle
            // { key: value } | { key: value, key2: value2 } | { key }

            const key = this.expect([{value: "key", type: TokenType.Identifier}], "Invalid object declaration.").value;

            // Handle key: pair -> { key, }
            if (this.at().type == TokenType.Comma) {
                this.eat() // Pass comma
                properties.push({ key, kind: "Property" } as Property);
                continue;
            } // Handle key: pair -> { key }
            else if (this.at().type == TokenType.CloseBrace){
                properties.push({ key, kind: "Property" } as Property);
                continue;
            }

            // Handle key: pair -> { key: value }
            this.expect([{value: ":", type: TokenType.Colon}], "Invalid object declaration.");
            const value = this.parse_expr();

            properties.push({kind: "Property", value, key} as Property);

            if (this.at().type != TokenType.CloseBrace) {
                this.expect([{value: ",", type: TokenType.Comma}], "Invalid object declaration.");
            }
        
        }

        this.expect([{value: "}", type: TokenType.CloseBrace}], "Invalid object declaration.");

        return { kind: "ObjectLiteral", properties } as ObjectLiteral
    }

    private parse_call_member_expr(): Expr {
        const member = this.parse_member_expr();

        if (this.at().type == TokenType.OpenParen) {
            return this.parse_call_expr(member);
        }
        
        return member;

    }

    private parse_call_expr(caller: Expr): Expr {
        let call_expr: Expr = {
            kind: "CallExpr",
            caller,
            args: this.parse_args(),
        } as CallExpr;

        if (this.at().type == TokenType.OpenParen) {
            call_expr = this.parse_call_expr(call_expr);
        }

        return call_expr;
    }

    private parse_args(): Expr[] {
        this.expect([{value: "(", type: TokenType.OpenParen}], "Unexpected token found!");

        const args = (this.at().type == TokenType.CloseParen) ? [] : this.parse_args_list();

        this.expect([{value: ")", type: TokenType.CloseParen}], "Unexpected token found!");
        
        return args;
    }

    // can handle this case -> foo(bar = 5, josh = "josh")
    private parse_args_list(): Expr[] {
        const args = [this.parse_assignment_expr()];
        
        while (!this.isEOF() && this.at().type == TokenType.Comma && this.eat()) {
            args.push(this.parse_assignment_expr())
        }

        return args;
    
    }

    private parse_member_expr(): Expr {
        let object = this.parse_primary_expr();

        while (this.at().type == TokenType.Dot || this.at().type == TokenType.OpenBracket) {
            const op = this.eat();

            let property: Expr;
            let isComputed: boolean;

            // Handle -> foo.bar
            if (op.type == TokenType.Dot) {
                isComputed = false;
                // Get identifier
                property = this.parse_primary_expr();

                if (property.kind != "Identifier") {
                    throw `You have no part of symphony 🐬🐬\n[Parsing Error] Cannot use DOT operator without right hand side being a idenifier.`
                }
                
            }
            // Handle -> foo["bar"]
            else {
                isComputed = true;
                property = this.parse_expr();
                this.expect([{value: "]", type: TokenType.CloseBracket}], "Missing closing bracket!");
            }

            object = {
                kind: "MemberExpr",
                object,
                property,
                isComputed
            } as MemberExpr
        }
    
        return object;

    }

    private parse_primary_expr(): Expr {
        const tk = this.at().type;

        switch (tk) {
            case TokenType.Identifier:
                return { kind: "Identifier", symbol: this.eat().value } as Identifier
            
            case TokenType.Number:
                return { 
                    kind: "NumericLiteral", 
                    value: parseFloat(this.eat().value) 
                } as NumericLiteral;
            
            case TokenType.OpenParen:
                this.eat();
                const value = this.parse_expr();
                this.expect([{value: ")", type: TokenType.CloseParen}], "Unexpected token found!");

                return value

            default:
                // This is just temp error message
                throw(`You are too skibidi for this language. Like FR dude?\n[Parsing Error] Unexpected token found during parsing: '${this.at().value}'`)
        }
    }

    // Order Exprs
    // Assignment
    // Object
    // Additions
    // Multiplication
    // Call
    // Member
    // Primary


    public produceAST(sourceCode: string): Program {
        this.tokens = tokenize(sourceCode)
        
        const program: Program = {
            kind: "Program",
            body: [],
        };

        // Parse until EOF
        while (!this.isEOF()) {
            program.body.push(this.parse_stmt());
        }

        return program
    }
}