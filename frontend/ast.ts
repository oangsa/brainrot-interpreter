export type NoteType = 
    | "Program" 
    | "NumericLiteral" 
    | "NullLiteral" 
    | "Identifier" 
    | "BinaryExpr" 
    | "CallExpr"
    | "UnaryExpr"
    | "FunctionDeclaration";

// 
export interface Statement {
    kind: NoteType;
}

export interface Program extends Statement {
    kind: "Program";
    body: Statement[];
}

export interface Expr extends Statement {}

export interface BinaryExpr extends Expr {
    kind: "BinaryExpr"
    lhs: Expr;
    rhs: Expr,
    operator: string;
}

export interface Identifier extends Expr {
    kind: "Identifier";
    symbol: string;
}

export interface NumericLiteral extends Expr {
    kind: "NumericLiteral";
    value: number;
}

export interface NullLiteral extends Expr {
    kind: "NullLiteral";
    value: "null";
}

