import { Statement, Program, Expr, BinaryExpr, NumericLiteral, Identifier, VarDeclaration, AssignmentExpr, Property, ObjectLiteral, CallExpr, MemberExpr, StringLiteral, FunctionDeclaration } from "./ast";
import { tokenize, Token, TokenType } from './lexer';

export default class Parser {
    private tokens: Token[] = [];

    private lineCounter: number = 1;
    private column: number = 0;
    private nonNLLine: number = 0;
    private nonNLColumn: number = 0;
    private lastNonNLLine: number = 0;
    private lastNonNLColumn: number = 0;

    private isEOF(): boolean {
        return this.tokens[0].type == TokenType.EOF;
    }

    private at(): Token {
        let token = this.tokens[0] as Token;
        while(token.type == TokenType.NewLine) {
            this.shift();
            token = this.tokens[0] as Token;
        }
        return token;
    }

    private eat(): Token {
        let prev;
        do {
            prev = this.shift();
        } while (prev.type == TokenType.NewLine);

        return prev;
    }

    private shift(): Token {
        const token = this.tokens.shift() as Token;

        switch(token.type) {
            case TokenType.NewLine:
                this.lineCounter++;
                break;
            case TokenType.String: {
                const split = token.raw.split("\n");
                this.lineCounter += split.length - 1;
                if(split.length > 1) {
                    this.column = split[split.length - 1].length + 1; // +1 for quote
                }
            }

            default:
                this.lastNonNLLine = this.nonNLLine;
                this.nonNLLine = this.lineCounter;
                if(token.type != TokenType.String && (token.type != TokenType.Identifier || token.value != "finishExit")) {
                    this.lastNonNLLine = this.nonNLLine;
                    this.nonNLLine = this.lineCounter;
                    this.column += token.value.length;
                    this.lastNonNLColumn = this.nonNLColumn;
                    this.nonNLColumn = this.column;
                }
                this.lastNonNLColumn = this.nonNLColumn;
                this.nonNLColumn = this.column;
                break;
        }
        return token;
    }


    private expect(type: TokenType, err: string): Token {
        const prev = this.eat();

        // console.log(`Expecting: ${type}, Found: ${prev.type}(${prev.value})`)

        if (!prev || prev.type != type) {
            console.error(`Parser error: (Line ${this.lastNonNLLine}, Col ${this.lastNonNLColumn + 1})\n`, err, "Expecting:", type);
            process.exit(1)
        }

        return prev;
    }

    private parse_stmt(): Statement {
        // Skip to parse_expr


        switch (this.at().type) {

            case TokenType.Var:
            case TokenType.Const:
                return this.parse_var_declaration();

            case TokenType.Fn:
                return this.parse_fn_declaration();

            case TokenType.NewLine:
                this.at(); // will remove all new lines
                return this.parse_stmt();

            default:
                return this.parse_expr();
        }
        // return this.parse_expr();
    }

    private parse_fn_declaration(): Statement {
        this.eat(); // Just pass the fn (cooking) keywords

        const name = this.at().type == TokenType.Identifier ? this.eat().value : "<anonymous>";

        const args = this.parse_args();
        const params: string[] = [];
        for (const arg of args) {
            if (arg.kind !== "Identifier") {
                throw `You have no part of symphony 🐬🐬\n[Parsing Error] Function params must be string!`
            }

            params.push((arg as Identifier).symbol)
        }

        this.expect(TokenType.OpenBrace, "Invalid function declaration!")

        const body: Statement[] = [];

        while (this.at().type != TokenType.EOF && this.at().type != TokenType.CloseBrace) {
            body.push(this.parse_stmt());
        }

        this.expect(TokenType.CloseBrace, "Invalid function declaration!")

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

        const ident = this.expect(TokenType.Identifier, "Unexpected token found! 'Variable name expected following \"sigma\"/\"beta\" statement.'").value;

        if ( this.at().type == TokenType.Semicolon ) {
            this.eat();
            if (isConstant) {
                throw `Uncaught "Must assign value to CONST variable to decalre."`;
            }

            return { kind: "VariableDeclaration", identifier: ident, isConstant: false, value: undefined } as VarDeclaration;
        }

        this.expect(TokenType.Equals, "Unexpected token found! 'Variable declaration must have an assignment.'");

        const declaration = { kind: "VariableDeclaration", isConstant: isConstant, value: this.parse_expr(), identifier: ident } as VarDeclaration;

        this.expect(TokenType.Semicolon, "Unexpected token found! 'Variable declaration must end with semicolon.'");

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
        return this.parse_assignment_expr();
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

        this.expect(TokenType.Quote, "String declaration must end with qoute or double qoute.")


        return strVal;
    }

    private parse_additive_expr(): Expr {

        let lhs = this.parse_multiplicitive_expr();

        while (["+", "-", "==", "!=", "<", ">", ">=", "<="].includes(this.at().value)) {
            const operator = this.eat().value;
            const rhs = this.parse_multiplicitive_expr();
            lhs = {
                kind: "BinaryExpr",
                lhs,
                rhs,
                operator
            } as BinaryExpr
        }
        return lhs;
    }

    private parse_and_expr(): Expr {
        let left = this.parse_additive_expr();

        if (["&&", "||"].includes(this.at().value)) {
            const operator = this.eat().value;
            const right = this.parse_additive_expr();

            left = {
                kind: "BinaryExpr",
                lhs: left,
                rhs: right,
                operator
            } as BinaryExpr;

            while(this.at().type == TokenType.And || this.at().type == TokenType.Bar) {
                left = {
                    kind: "BinaryExpr",
                    lhs: left,
                    operator: this.eat().value,
                    rhs: this.parse_expr(),
                } as BinaryExpr;
            }
        }

        return left;
    }

    private parse_multiplicitive_expr(): Expr {
        let lhs = this.parse_call_member_expr();

        while (["/", "*", "%"].includes(this.at().value)) {
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

        // console.log(this.at())

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
            const key = this.eat().value;

            // Handle key: pair -> { key, }

            if (this.at().type == TokenType.Comma) {
                this.eat(); // advance past comma (,)
                properties.push({ key, kind: "Property" } as Property);
                continue;
            }
            // Handle key: pair -> { key }
            else if (this.at().type == TokenType.CloseBrace){
                properties.push({ key, kind: "Property" } as Property);
                continue;
            }

            // Handle key: pair -> { key: value }

            this.expect(TokenType.Colon, "Invalid object declaration. 'Expected ':' after key.'");
            const value = this.parse_expr();

            properties.push({kind: "Property", value, key} as Property);

            if (this.at().type != TokenType.CloseBrace) {
                this.expect(TokenType.Comma, "Invalid object declaration. 'Expected ',' after value.'");
            }

        }

        this.expect(TokenType.CloseBrace, "Invalid object declaration. 'Expected '}' to close object.'");

        return { kind: "ObjectLiteral", properties } as ObjectLiteral
    }

    // private parse_object_expr(): Expr {
    //     // if (this.at().type !== TokenType.OpenBrace) {
    //     //     return this.parse_array_expr();
    //     // }

    //     this.eat(); // advance past {

    //     const properties = new Array<Property>();

    //     while (!this.isEOF && this.at().type != TokenType.CloseBrace) {
    //         // { key: val, key2: val }
    //         if(this.at().type != TokenType.Identifier && this.at().type != TokenType.String) {
    //             throw new Error("Identifier expected following \"Object\" expression.");
    //         }

    //         const key = this.eat().value;

    //         // Allows shorthand key: pair -> { key, }
    //         if (this.at().type == TokenType.Comma) {
    //             this.eat(); // advance past comma (,)
    //             properties.push({ key, kind: "Property" });
    //             continue;
    //         } // Allows shorthand key: pair -> { key }
    //         else if (this.at().type == TokenType.CloseBrace) {
    //             properties.push({ key, kind: "Property" });
    //             continue;
    //         }
    //         // { key: val }

    //         this.expect(TokenType.Colon, "Colon (\":\") expected following \"identifier\" in \"Object\" expression.");
    //         const value = this.parse_expr();

    //         properties.push({ key, value, kind: "Property" });

    //         if (this.at().type != TokenType.CloseBrace) {
    //             this.expect(TokenType.Comma, "Comma (\",\") or closing brace (\"}\") expected after \"property\" declaration.");
    //             continue;
    //         }
    //     }

    //     this.expect(TokenType.CloseBrace, "Closing brace (\"}\") expected at the end of \"Object\" expression.");
    //     return { kind: "ObjectLiteral", properties } as ObjectLiteral;
    // }

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
        this.expect(TokenType.OpenParen, "Unexpected token found! 'Expected '(' at the start of arguments.'");

        const args = (this.at().type == TokenType.CloseParen) ? [] : this.parse_args_list();

        this.expect(TokenType.CloseParen, "Unexpected token found! 'Expected ')' at the end of arguments.'");

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
                this.expect(TokenType.CloseBracket, "Missing closing bracket!");
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
                this.expect(TokenType.CloseParen, "Unexpected token found! 'Expected ')' to close expression.'");
                return value

            case TokenType.String:
                return {  kind: "StringLiteral", value: this.eat().value } as StringLiteral

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
        this.tokens = tokenize(sourceCode);

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
