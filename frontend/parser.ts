import { Statement, Program, Expr, BinaryExpr, NumericLiteral, Identifier, VarDeclaration, AssignmentExpr } from "./ast";
import { tokenize, Token, TokenType } from './lexer';

export default class Parser {
    private tokens: Token[] = [];
    
    private isEOF (): boolean {
        return this.tokens[0].type == TokenType.EOF;
    }

    private at () {
        return this.tokens[0] as Token;
    }

    private eat () {
        const prev = this.tokens.shift() as Token;
        return prev;
    }

    private expect (types: Token[], err: any) {
        const prev = this.tokens.shift() as Token;

        let Types: Array<any> = [];
        let val: string = "";
        let ctr: number = 0;
        
        types.forEach((t) => {
            Types.push(t.type);
            val += t.value;
            if (types.length > 1 && ctr < types.length - 1) {
                val += " | ";
                ctr++;
            }
        });

        if (!prev || !Types.includes(prev.type)) {
                throw(`You are too skibidi for this language. Like FR dude?\n[Parsing Error] ${err}: '${prev.value}'\n- Expecting: '${val}'`)
        }

        return prev;
    }

    private parse_stmt (): Statement {
        // Skip to parse_expr
        switch (this.at().type) {
            case TokenType.Var:
            case TokenType.Const:
                return this.parse_var_declaration()

            default: 
                return this.parse_expr();
        }
        // return this.parse_expr();
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
        const left = this.parse_additive_expr();

        if (this.at().type == TokenType.Equals) {
            this.eat(); // Just pass the equal sign;
            const value = this.parse_assignment_expr();
            return {value, assigne: left, kind: "AssignmentExpr"} as AssignmentExpr

        }

        // this.expect([{value: "=", type: TokenType.Equals}], "Unexpected token found!")

        // this.eat();

        // this.expect([{value: ";", type: TokenType.Semicolon}], "Unexpected token found! 'Variable declaration must end with semicolon.'");

        return left;
    }
    
    private parse_expr(): Expr {
        return  this.parse_assignment_expr();
    }
    
    private parse_additive_expr() : Expr {
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

    private parse_multiplicitive_expr() : Expr {
        let lhs = this.parse_primary_expr();
        
        while ( this.at().value == "/" || this.at().value == "*" || this.at().value == "%") {
            const operator = this.eat().value;
            const rhs = this.parse_primary_expr();
            lhs = {
                kind: "BinaryExpr",
                lhs,
                rhs,
                operator
            } as BinaryExpr
        }

        return lhs;
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