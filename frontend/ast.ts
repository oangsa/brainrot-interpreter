export type NodeType =
    // Statements
    | "Program"
    | "VariableDeclaration"
    | "FunctionDeclaration"
    | "IfStatement"

    // Expressions
    | "AssignmentExpr"
    | "BinaryExpr"
    | "CallExpr"
    | "UnaryExpr"
    | "MemberExpr"
    | "RelationalExpr"

    // Literals
    | "Property"
    | "ObjectLiteral"
    | "Identifier"
    | "StringLiteral"
    | "NumericLiteral";

export interface Statement {
    kind: NodeType;
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

export interface FunctionDeclaration extends Statement {
    kind: "FunctionDeclaration";
    params: string[];
    name: string;
    body: Statement[];
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

export interface UnaryExpr extends Expr {
    kind: "UnaryExpr";
    operator: string;
    expr: Expr;
}

export interface RelationalExpr extends Expr {
    kind: "RelationalExpr";
    lhs: Expr;
    rhs: Expr;
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

export interface StringLiteral extends Expr {
    kind: "StringLiteral";
    value: string;
}
export interface Property extends Expr {
    kind: "Property";
    key: string;
    value?: Expr;
}
export interface ObjectLiteral extends Expr {
    kind: "ObjectLiteral";
    properties: Property[];
}

export interface MemberExpr extends Expr {
    kind: "MemberExpr";
    object: Expr;
    property: Expr;
    isComputed: boolean;
}

export interface CallExpr extends Expr {
    kind: "CallExpr";
    args: Expr[];
    caller: Expr;
}

export interface IfStatementExpr extends Expr {
    kind: "IfStatement";
    condition: Expr;
    body: Statement[];
    alternate?: Statement[];
}
