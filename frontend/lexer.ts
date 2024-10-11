// let x = 45;
// [LetToken, IdentifierToken, EqualsToken, NumberToken]

export enum TokenType {
    Number,
    Identifier,
    Null,


    // Grouping & Operator
    Equals,
    OpenParen, 
    CloseParen,
    BinaryOperator,
    RelationalOperator,
    EOF, // Signified the end of file

    // Keywords
    Var,
    Const,
}

const KEYWORDS: Record<string, TokenType> = {
    "beta": TokenType.Var,
    "sigma": TokenType.Const,
    "null": TokenType.Null,
}

export interface Token {
    value: string;
    type: TokenType;
}

function token (value: string = "", type: TokenType): Token {
    return { value, type };
}

function isAlpha (src: string) {
    // to check character is alphabet or not
    return src.toUpperCase() != src.toLowerCase();
}

function isNumber (str: string) {
    const char = str.charCodeAt(0);
    const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)];
    return (char >= bounds[0] && char <= bounds[1])
}

function isSkippable (str: string) {
    return str == " " || str == "\n" || str == "\t" || str == "\r" || str == ";" || str == "\0";
}

function isRelationalOp(str: string) {
    return str == '>' || str == '<' || str == '='
}

export function tokenize (sourceCode: string): Token[] {
    const tokens = new Array<Token>();
    const src = sourceCode.split("");

    // Build the token until the EOF
    while (src.length > 0) {
        if (src[0] == '(') {
            tokens.push(token(src.shift(), TokenType.OpenParen));
        } 
        else if (src[0] == ')') {
            tokens.push(token(src.shift(), TokenType.CloseParen))
        } 
        else if (src[0] == '+' || src[0] == '-' || src[0] == '*' || src[0] == '/' || src[0] == "%") {
            tokens.push(token(src.shift(), TokenType.BinaryOperator));
        }
        // else if (src[0] == '=') {
        //     tokens.push(token(src.shift(), TokenType.Equals));
        // }
        else {
            // Handle multicharacter tokens
            if (isRelationalOp(src[0])) {
                let op = "" as string;
                while (src.length > 0 && isRelationalOp(src[0])) {
                    op += src.shift();
                }
                if (op == "=") {
                    tokens.push(token(op, TokenType.Equals));
                }
                else {
                    tokens.push(token(op, TokenType.RelationalOperator));
                }
            }
            else if (isNumber(src[0])) {
                let num = "";
                while (src.length > 0 && isNumber(src[0])) {
                    num += src.shift();
                }

                tokens.push(token(num, TokenType.Number))
            }
            else if (isAlpha(src[0])) {
                let ident = "";
                while (src.length > 0 && isAlpha(src[0])) {
                    ident += src.shift();
                }

                // check for reserved keywords
                const reserved = KEYWORDS[ident];

                if (typeof reserved == "number") {
                    tokens.push(token(ident, reserved));
                }   
                else {
                    tokens.push(token(ident, TokenType.Identifier))
                }
                
            }
            else if (isSkippable(src[0])) {
                // Just skip the current character
                src.shift();
            } else {
                throw(`You are too skibidi for this language. Like FR dude?\n[Tokenize Error] Unrecognize token found: '${src[0]}'`);
            }

        }
    }
    tokens.push({type: TokenType.EOF, value: "EndOfFile"})
    return tokens;
}


// const file = Bun.file("./main.gzc");
// const source = await file.text();

// // console.log(source)

// // for (const token of source) {
// //     console.log(JSON.stringify(token))
// // }

// for (const token of tokenize(source)) {
//     console.log(token);
// }