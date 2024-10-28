// let x = 45;
// [LetToken, IdentifierToken, EqualsToken, NumberToken]

export enum TokenType {
    Number,
    Identifier,
    String,

    // Grouping & Operator
    Equals,
    Semicolon,
    Comma,
    Colon,
    Dot,
    Quote,
    OpenBrace,
    CloseBrace,
    OpenBracket,
    CloseBracket,
    OpenParen, 
    CloseParen,
    BinaryOperator,
    RelationalOperator,
    EOF, // Signified the end of file

    // Keywords
    Var,
    Const,
    Fn,
    Comment
}

var flag: boolean = false;
var isYap: boolean = false;

const KEYWORDS: Record<string, TokenType> = {
    "beta": TokenType.Var,
    "sigma": TokenType.Const,
    "cooking": TokenType.Fn,
    "yap": TokenType.Comment,
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
    return str == " " || str == "\n" || str == "\t" || str == "\r" || str == "\0";
}

function isRelationalOp(str: string) {
    return str == '>' || str == '<' || str == '='
}

export function tokenize (sourceCode: string): Token[] {
    const tokens = new Array<Token>();
    const src = sourceCode.split("");

    // Build the token until the EOF
    while (src.length > 0) { 
        while (isYap == true && src[0] != "\r" && src[0] != undefined) {
            src.shift();
            continue;
        }

        isYap = false;

        if (src[0] == undefined) break;

        if (src[0] == '(') {
            tokens.push(token(src.shift(), TokenType.OpenParen));
            continue;
        } 
        else if (src[0] == ')') {
            tokens.push(token(src.shift(), TokenType.CloseParen));
            continue;
        }
        else if (src[0] == '{') {
            tokens.push(token(src.shift(), TokenType.OpenBrace));
            continue;
        }
        else if (src[0] == '}') {
            tokens.push(token(src.shift(), TokenType.CloseBrace));
            continue;
        }
        else if (src[0] == '[') {
            tokens.push(token(src.shift(), TokenType.OpenBracket));
            continue;
        }
        else if (src[0] == ']') {
            tokens.push(token(src.shift(), TokenType.CloseBracket));
            continue;
        }
        else if (src[0] == ";") {
            tokens.push(token(src.shift(), TokenType.Semicolon));
            continue;
        }
        else if (src[0] == ",") {
            tokens.push(token(src.shift(), TokenType.Comma));
            continue;
        }
        else if (src[0] == ":") {
            tokens.push(token(src.shift(), TokenType.Colon));
            continue;
        }
        else if (src[0] == ".") {
            tokens.push(token(src.shift(), TokenType.Dot));
            continue;
        }
        else if (src[0] == '"' || src[0] == "'") {
            tokens.push(token(src.shift(), TokenType.Quote));
            flag = true;
            continue;
        }
        else if (src[0] == '+' || src[0] == '-' || src[0] == '*' || src[0] == '/' || src[0] == "%") {
            tokens.push(token(src.shift(), TokenType.BinaryOperator));
            continue;
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
                continue;
            }
            else if (isNumber(src[0])) {
                let num = "";
                while (src.length > 0 && isNumber(src[0])) {
                    num += src.shift();
                }

                tokens.push(token(num, TokenType.Number));
                continue;
            }
            else if (isAlpha(src[0])) {
                let ident = "";
                // while (src.length > 0 && isAlpha(src[0])) {
                //     ident += src.shift();
                // }
                if (flag == false) {
                    while (src.length > 0 && isAlpha(src[0])) {
                        ident += src.shift();
                    }
                }
                else {
                    while (flag) {
                        if (src[0] == '"' || src[0] == "'") {
                            break;
                        }
                        ident += src.shift();
                    }
                }

                // check for reserved keywords
                const reserved = KEYWORDS[ident];

                // To check if the line is comment or not.
                if (reserved == TokenType.Comment) {
                    isYap = true;
                    continue
                }

                if (typeof reserved == "number") {
                    tokens.push(token(ident, reserved));
                }   
                else {
                    tokens.push(token(ident, TokenType.Identifier));
                }
                if (flag) tokens.push(token(src.shift(), TokenType.Quote));
                flag = false;
                continue;
            }
            else if (isSkippable(src[0])) {
                // Just skip the current character
                src.shift();
                continue;
            } else {
                throw(`You are too skibidi for this language. Like FR dude?\n[Tokenize Error] Unrecognize token found: '${src[0]}'`);
            }

        }
    }
    tokens.push({type: TokenType.EOF, value: "EndOfFile"});
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