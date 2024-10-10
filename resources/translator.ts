const map = {
    // Comment
    "yap": "//",

    // Variable Declaration
    "beta": "var",
    "sigma": "const",

    // Input, Output
    "flex": "console.log",
    "left on read": "prompt",

    // Datatypes
    "vibe": "boolean",
    "stack": "number",
    "quote": "string",
    "squad": "array",
    "facts": "dictionary",

    // Conditional Statement
    "vibe check": "if",
    "lowkey vibe check": "else if",
    "bro did not pass": "else",

    // Iteration
    "bussin": "while",
    "bounce": "break",
    "slide": "continue",
    "do the most": "for",

    // Arithmatic Operators
    "drip": "+",
    "lack": "-",
    "combo": "*",
    "ratio": "/",

    // Relational Operators
    "same vibe": "==",
    "not same vibe": "!=",
    "sus": "!",
    "flexin": ">",
    "humble": "<",
    "flexin or chillin": ">=",
    "humble or chillin": "<=",

    // Exceptions
    "yeet": "throw",
    "red flag": "error",
    "send it": "try",
    "caught in 4k": "catch",
    "last chance bro": "finally",

}
  


export default function script_to_js(script: string): string | undefined {
    return map[script]
}