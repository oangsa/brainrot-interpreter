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
    Greater, // >
    GreaterEquals, // >=
    Lesser, // <
    LesserEquals, // <=
    EqualsCompare, // ==
    NotEqualsCompare, // !=
    Exclamation, // !
    And, // &&
    Ampersand, // &
    Bar, // |
    Or, // ||


    NewLine,
    EOF, // Signified the end of file

    // Keywords
    Var,
    Const,
    Fn,
    Comment,
    If,
    Else,
    Throw
}

var flag: boolean = false;
var isYap: boolean = false;

const KEYWORDS: Record<string, TokenType> = {
    beta: TokenType.Var,
    sigma: TokenType.Const,
    cooking: TokenType.Fn,
    yap: TokenType.Comment,
    sus: TokenType.If,
    imposter: TokenType.Else,
    yeet: TokenType.Identifier
}

const TOKEN_CHARS: Record<string, TokenType> = {
    "(": TokenType.OpenParen,
    ")": TokenType.CloseParen,
    "{": TokenType.OpenBrace,
    "}": TokenType.CloseBrace,
    "[": TokenType.OpenBracket,
    "]": TokenType.CloseBracket,
    ";": TokenType.Semicolon,
    ",": TokenType.Comma,
    ":": TokenType.Colon,
    ".": TokenType.Dot,
    "'": TokenType.Quote,
    '"': TokenType.Quote,
    "+": TokenType.BinaryOperator,
    "-": TokenType.BinaryOperator,
    "*": TokenType.BinaryOperator,
    "/": TokenType.BinaryOperator,
    "%": TokenType.BinaryOperator,
    "=": TokenType.Equals,
    ">": TokenType.Greater,
    ">=": TokenType.GreaterEquals,
    "<": TokenType.Lesser,
    "<=": TokenType.LesserEquals,
    "==": TokenType.EqualsCompare,
    "!=": TokenType.NotEqualsCompare,
    "!": TokenType.Exclamation,
    "&&": TokenType.And,
    "&": TokenType.Ampersand,
    "|": TokenType.Bar,
    "||": TokenType.Or,
    "\n": TokenType.NewLine
}

const ESCAPED_CHARS: Record<string, string> = {
    "n": "\n",
    "r": "\r",
    "t": "\t",
    "0": "\0"
}

const reverseTokenType: Record<number, string> = Object.keys(TokenType)
    .filter(key => typeof TokenType[key as keyof typeof TokenType] === "number")
    .reduce((obj, key) => {
        obj[TokenType[key as keyof typeof TokenType]] = key;
        return obj;
    }, {} as Record<number, string>);

export interface Token {
    value: string; // contains the value as seen inside the source code.
    type: TokenType; // tagged structure.
    raw: string; // actual raw value. used for column in strings
    toString: () => object;
}

export function token(value: string = "", type: TokenType, raw: string = value): Token {
    return { value, type, raw, toString: () => {return {value, type: reverseTokenType[type]}} };
}

function isAlpha(src: string, isFirstChar: boolean = false) {
    if (isFirstChar) {
        return /^[A-Za-z_]+$/.test(src);
    }
    return /^[A-Za-z0-9_]+$/.test(src);
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
    return str == '>' || str == '<' || str == '=' || str == '!' || str == '&' || str == '|';
}

function getPrevIdents(tokens: Array<Token>): Token[] | null {
    const reversed = [...tokens].reverse();
    const newTokens: Token[] = [];
    for(const token of reversed) {
        if(token.type == TokenType.Identifier ||
            token.type == TokenType.Dot ||
            token.type == TokenType.OpenBracket ||
            token.type == TokenType.CloseBracket ||
            (tokens[tokens.length - newTokens.length - 2] && tokens[tokens.length - newTokens.length - 2].type == TokenType.OpenBracket && token.type == TokenType.Number)) {
                newTokens.push(token);
            } else {
                break;
            }
    }
    return newTokens.length > 0 ? newTokens.reverse() : null;
}

export function tokenize (sourceCode: string): Token[] {
    const tokens = new Array<Token>();
    const src = sourceCode.split("");

    // Build the token until the EOF
    while (src.length > 0) {
        const char = src[0];

        const tokenType = TOKEN_CHARS[char];

        while (isYap == true && src[0] != "\r" && src[0] != undefined) {
            src.shift();
            continue;
        }

        isYap = false;


        if (isNumber(char) || (char == "-" && isNumber(src[1]))) {
            let num = src.shift();
            let period = false;
            while (src.length > 0) {
                if(src[0] == "." && !period) {
                    period = true;
                    num += src.shift()!;
                }
                else if (isNumber(src[0])) {
                    num += src.shift()!;
                }
                else break;
            }

            // append new numeric token.
            tokens.push(token(num, TokenType.Number));
        }
        else {
            switch(char) {
                case ">":
                    src.shift()
                    if (src[0] == '=') {
                        src.shift()
                        tokens.push(token('>=', TokenType.GreaterEquals));
                    } else {
                        tokens.push(token(">", TokenType.Greater));
                    }
                    break;

                case "<":
                    src.shift()
                    if (src[0] == '=') {
                        src.shift()
                        tokens.push(token('<=', TokenType.LesserEquals));
                    } else {
                        tokens.push(token("<", TokenType.Lesser));
                    }
                    break;

                case "|":
                    src.shift()
                    if (src[0] == '|') {
                        src.shift()
                        tokens.push(token('||', TokenType.Or));
                    } else {
                        tokens.push(token("|", TokenType.Bar));
                    }
                    break;

                case "=":
                    src.shift()
                    if (src[0] == '=') {
                        src.shift()
                        tokens.push(token('==', TokenType.EqualsCompare));
                    } else {
                        tokens.push(token("=", TokenType.Equals));
                    }
                    break;
                case "&":
                    src.shift()
                    if (src[0] == '&') {
                        src.shift()
                        tokens.push(token('&&', TokenType.And));
                    } else {
                        tokens.push(token("&", TokenType.Ampersand));
                    }
                    break;
                case "!":
                    src.shift();
                    if (String(src[0]) == '=') {
                        src.shift()
                        tokens.push(token("!=", TokenType.NotEqualsCompare));
                    } else {
                        tokens.push(token("!", TokenType.Exclamation));
                    }
                    break;
                case '"': {
                    let str = "";
                    let raw = "";
                    src.shift();

                    let escaped = false;
                    while (src.length > 0) {
                        const key = src.shift();
                        raw += key;
                        if(key == "\\") {
                            escaped = !escaped;
                            if(escaped)continue;
                        }
                        else if (key == '"') {
                            if(!escaped) {
                                break;
                            }
                            escaped = false;
                        }
                        else if (escaped) {
                            escaped = false;
                            if(ESCAPED_CHARS[key as string]) {
                                str += ESCAPED_CHARS[key as string];
                                continue;
                            } else {
                                str += `\\`;
                            }
                        }
                        str += key;
                    }

                    // append new string token.
                    tokens.push(token(str, TokenType.String, raw.substring(0, raw.length - 1)));
                    break;
                }
                case "-":
                    if(src[1] != src[0]) {
                        const previdents = getPrevIdents(tokens);
                        if(previdents == null && tokens[tokens.length - 1].type != TokenType.CloseParen) {
                            tokens.push(token("0", TokenType.Number));
                            tokens.push(token(src.shift(), TokenType.BinaryOperator));
                            break;
                        }
                    }
                case "+":
                    if(src[1] == src[0]) {
                        const prevtokens = getPrevIdents(tokens);
                        if(prevtokens != null) {
                            tokens.push(token("=", TokenType.Equals));
                            prevtokens.forEach(token => tokens.push(token));
                            tokens.push(token(src.shift(), TokenType.BinaryOperator));
                            tokens.push(token("1", TokenType.Number));
                            src.shift();
                            break;
                        }
                    }

                // case "yap":
                //     do {
                //         src.shift();
                //     } while (src.length > 0 && src[0] != "\r" && src[0] != undefined); // fuck off typescript
                //     src.shift();
                //     break;

                default:

                    if(tokenType) {
                        tokens.push(token(src.shift(), tokenType));
                    }
                    else if (isAlpha(char, true)) {
                        let ident = "";
                        ident += src.shift();  // Add first character which is alphabetic or underscore

                        while (src.length > 0 && isAlpha(src[0])) {
                            ident += src.shift();  // Subsequent characters can be alphanumeric or underscore
                        }

                        // CHECK FOR RESERVED KEYWORDS
                        const reserved = KEYWORDS[ident];
                        // If value is not undefined then the identifier is
                        // recognized keyword

                        if (reserved == TokenType.Comment) {
                            isYap = true;
                            continue;
                        }

                        if (typeof reserved == "number") {
                            tokens.push(token(ident, reserved));
                        }
                        else {
                            // Unrecognized name must mean user-defined symbol.
                            tokens.push(token(ident, TokenType.Identifier));
                        }
                    }
                    else if (isSkippable(src[0])) {
                        // Skip unneeded chars.
                        src.shift();
                    }
                    else {
                        throw(`You are too skibidi for this language. Like FR dude?\n[Tokenize Error] Unrecognize token found: '${src[0]}'`);
                    }

            }
        }
    }

    tokens.push(token("EOF", TokenType.EOF));
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
