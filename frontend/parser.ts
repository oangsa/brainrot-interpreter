import { Statement, Program, Expr, BinaryExpr, NumericLiteral, Identifier, NullLiteral } from "./ast";
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

    private expect (type: Token, err: any) {
        const prev = this.tokens.shift() as Token;

        if (!prev || prev.type != type.type) {
            throw(`You are too skibidi for this language. Like FR dude?\n[Parsing Error] ${err}: '${prev.value}'\n- Expecting: '${type.value}'`)
        }
        return prev;
    }

    private parse_stmt (): Statement {
        // Skip to parse_expr
        return this.parse_expr();
    }
    
    private parse_expr (): Expr {
        return this.parse_additive_expr();
    }
    
    private parse_additive_expr () : Expr {
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

    private parse_multiplicitive_expr () : Expr {
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

    private parse_primary_expr (): Expr {
        const tk = this.at().type;

        switch (tk) {
            case TokenType.Identifier:
                return { kind: "Identifier", symbol: this.eat().value } as Identifier
            
            case TokenType.Null:
                this.eat();
                return { kind: "NullLiteral", value: "null" } as NullLiteral;
            
            case TokenType.Number:
                return { 
                    kind: "NumericLiteral", 
                    value: parseFloat(this.eat().value) 
                } as NumericLiteral;
            
            case TokenType.OpenParen:
                this.eat();
                const value = this.parse_expr();
                this.expect({value: ")", type: TokenType.CloseParen}, "Unexpected token found!");

                return value

            default:
                // This is just temp error message
                throw(`You are too skibidi for this language. Like FR dude?\n[Parsing Error] Unexpected token found during parsing: '${this.at().value}'`)
        }
    }

    public produceAST (sourceCode: string): Program {
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