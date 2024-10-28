export type NoteType = 
    // Statements
    | "Program"
    | "VariableDeclaration"
    | "FunctionDeclaration"
    
    // Expressions
    | "NumericLiteral"
    | "AssignmentExpr"
    | "Identifier" 
    | "BinaryExpr" 
    | "CallExpr"
    | "UnaryExpr";

export interface Statement {
    kind: NoteType;
}

export interface Program extends Statement {
    kind: "Program";
    body: Statement[];
}

export interface VarDeclaration extends Statement {
    kind: "VariableDeclaration";
    isConstant: boolean;
    identifier: string;
    value?: Expr
}

export interface Expr extends Statement {}

export interface AssignmentExpr extends Expr {
    kind: "AssignmentExpr";
    assigne: Expr;
    value: Expr;
}

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

