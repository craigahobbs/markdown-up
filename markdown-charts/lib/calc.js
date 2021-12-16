// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/calc */

import {SchemaMarkdownParser} from '../../schema-markdown/lib/parser.js';
import {validateType} from '../../schema-markdown/lib/schema.js';


// The calc model's Schema Markdown
const calcModelSmd = `\
# The calculation language expression specification
union CalcExpr

    # A binary expression
    CalcExprBinary binary

    # A unary expression
    CalcExprUnary unary

    # A function expression
    CalcExprFunction function

    # A field value
    string field

    # A number literal
    float number

    # A string literal
    string string


# A calculation language binary expression
struct CalcExprBinary

    # The binary expression operator
    CalcExprBinaryOperator operator

    # The left expression
    CalcExpr left

    # The right expression
    CalcExpr right


# A calculation language binary expression operator
enum CalcExprBinaryOperator
    "+"
    "&&"
    "&"
    "/"
    "=="
    "^"
    ">"
    ">="
    "<"
    "<="
    "%"
    "*"
    "||"
    "-"


# A calculation language unary expression
struct CalcExprUnary

    # The unary expression operator
    CalcExprUnaryOperator operator

    # The expression
    CalcExpr expr


# A calculation language unary expression operator
enum CalcExprUnaryOperator
    "-"
    "!"


# A calculation language function expression
struct CalcExprFunction

    # The function
    CalcExprFunctionEnum function

    # The function arguments
    optional CalcExpr[] arguments


# A calculation language function
enum CalcExprFunctionEnum
    abs
    ceil
    date
    day
    fixed
    floor
    hour
    if
    left
    len
    lower
    ln
    log
    log10
    mid
    minute
    month
    mround
    now
    rand
    replace
    rept
    right
    round
    second
    search
    sign
    sqrt
    substitute
    text
    today
    trim
    upper
    value
    year
`;


/**
 * The calculation language model
 *
 * @property {string} title - The model's title
 * @property {Object} types - The model's referenced types dictionary
 */
export const calcModel = {
    'title': 'The Calculation Language Model',
    'types': new SchemaMarkdownParser(calcModelSmd).types
};


// Function map (name => fn)
const calcFunctions = {
    'abs': ([number]) => Math.abs(number),
    'ceil': ([number]) => Math.ceil(number),
    'date': ([year, month, day]) => new Date(year, month - 1, day),
    'day': ([datetime]) => datetime.getDate(),
    'fixed': ([number, decimals = 2]) => number.toFixed(decimals),
    'floor': ([number]) => Math.floor(number),
    'hour': ([datetime]) => datetime.getHours(),
    'if': ([condition, valueTrue, valueFalse]) => (condition ? valueTrue : valueFalse),
    'left': ([text, numChars = 1]) => text.slice(0, numChars),
    'len': ([text]) => text.length,
    'lower': ([text]) => text.toLowerCase(),
    'ln': ([number]) => Math.log(number),
    'log': ([number, base = 10]) => Math.log(number) / Math.log(base),
    'log10': ([number]) => Math.log10(number),
    'mid': ([text, startNum, numChars]) => text.slice(startNum, startNum + numChars),
    'minute': ([datetime]) => datetime.getMinutes(),
    'month': ([datetime]) => datetime.getMonth() + 1,
    'now': () => new Date(),
    'rand': () => Math.random(),
    'replace': () => 0,
    'rept': () => 0,
    'right': ([text, numChars = 1]) => text.slice(numChars),
    'round': () => 0,
    'second': ([datetime]) => datetime.getSeconds(),
    'search': () => 0,
    'sign': ([number]) => Math.sign(number),
    'sqrt': ([number]) => Math.sqrt(number),
    'substitute': () => 0,
    'text': () => 0,
    'today': () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    },
    'trim': ([text]) => text.trim(),
    'upper': ([text]) => text.toUpperCase(),
    'value': () => 0,
    'year': ([datetime]) => datetime.getFullYear()
};


// Binary operator map (str => {op, fn})
const binaryOperators = {
    '+': (left, right) => left + right,
    '&&': (left, right) => left && right,
    '&': (left, right) => left + right,
    '/': (left, right) => left / right,
    '==': (left, right) => left === right,
    '^': (left, right) => left ** right,
    '>': (left, right) => left > right,
    '>=': (left, right) => left >= right,
    '<': (left, right) => left < right,
    '<=': (left, right) => left <= right,
    '%': (left, right) => left % right,
    '*': (left, right) => left * right,
    '||': (left, right) => left || right,
    '-': (left, right) => left - right
};


// Unary operator map (str => {op, fn})
const unaryOperators = {
    '-': (value) => -value,
    '!': (value) => !value
};


// Calculation language expression regex
const rCalcBinaryOp = new RegExp(`^\\s*(${Object.keys(binaryOperators).map((op) => op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);
const rCalcUnaryOp = new RegExp(`^\\s*(${Object.keys(unaryOperators).join('|')})`);
const rCalcFunctionOpen = new RegExp(`^\\s*(${Object.keys(calcFunctions).join('|')})\\s*\\(`);
const rCalcFunctionSeparator = /^\s*,/;
const rCalcFunctionClose = /^\s*\)/;
const rCalcGroupOpen = /^\s*\(/;
const rCalcGroupClose = /^\s*\)/;
const rCalcNumber = /^\s*([+-]?\d+(?:\.\d*)?)/;
const rCalcString = /^\s*'((?:\\'|[^'])*)'/;
const rCalcStringUnescape = /\\([\\'])/g;
const rCalcStringDouble = /^\s*"((?:\\"|[^"])*)"/;
const rCalcStringDoubleUnescape = /\\([\\"])/g;
const rCalcField = /^\s*\[\s*((?:\\\]|[^\]])+)\s*\]/;
const rCalcFieldUnescape = /\\([\\\]])/g;


/**
 * Validate a calculation language model
 *
 * @param {Object} expr - The calculation language model
 * @returns {Object} The validated calculation language model
 */
export function validateCalculation(expr) {
    return validateType(calcModel.types, 'CalcExpr', expr);
}


/**
 * Excecute a calculation language model
 *
 * @param {Object} expr - The calculation language model
 * @param {Object} [row = null] - The current row (for resolving field expressions)
 * @param {Object} [rowFallback = null] - If the field is not in "row", look for it here
 * @returns {string|number|Date|boolean|null} The calculation result
 */
export function executeCalculation(expr, row = null, rowFallback = null) {
    if ('binary' in expr) {
        return binaryOperators[expr.binary.operator](
            executeCalculation(expr.binary.left, row, rowFallback),
            executeCalculation(expr.binary.right, row, rowFallback)
        );
    } else if ('unary' in expr) {
        return unaryOperators[expr.unary.operator](
            executeCalculation(expr.unary.expr, row, rowFallback)
        );
    } else if ('function' in expr) {
        return calcFunctions[expr.function.function](
            expr.function.arguments.map((arg) => executeCalculation(arg, row, rowFallback))
        );
    } else if ('field' in expr) {
        return row !== null && expr.field in row ? row[expr.field]
            : (rowFallback !== null && expr.field in rowFallback ? rowFallback[expr.field] : null);
    } else if ('number' in expr) {
        return expr.number;
    }
    // else if ('string' in expr) {
    return expr.string;
}


/**
 * Parse a calculation language expression
 *
 * @param {string} exprText - The calculation language expression
 * @returns {Object} The calculation language model
 */
export function parseCalculation(exprText) {
    const [expr, nextText] = parseExpression(exprText);
    const syntaxError = nextText.trim();
    if (syntaxError !== '') {
        throw new Error(`Syntax error "${syntaxError}"`);
    }
    return expr;
}


// Helper function to parse an expression
function parseExpression(exprText) {
    const [leftExpr, nextText] = parseSubExpression(exprText);
    return parseBinaryOperator(nextText, leftExpr);
}


// Helper function to parse an expression NOT including binary operator sub-expressions
function parseSubExpression(exprText) {
    // Group open?
    const matchGroupOpen = exprText.match(rCalcGroupOpen);
    if (matchGroupOpen !== null) {
        const groupText = exprText.slice(matchGroupOpen[0].length);
        const [expr, nextText] = parseExpression(groupText);
        const matchGroupClose = nextText.match(rCalcGroupClose);
        if (matchGroupClose === null) {
            throw new Error(`Unmatched parenthesis "${exprText}"`);
        }
        return [expr, nextText.slice(matchGroupOpen[0].length)];
    }

    // Unary operator?
    const matchUnary = exprText.match(rCalcUnaryOp);
    if (matchUnary !== null) {
        const unaryText = exprText.slice(matchUnary[0].length);
        const [expr, nextText] = parseSubExpression(unaryText);
        const unaryExpr = {
            'unary': {
                'operator': matchUnary[1],
                expr
            }
        };
        return [unaryExpr, nextText];
    }

    // Function?
    const matchFunctionOpen = exprText.match(rCalcFunctionOpen);
    if (matchFunctionOpen !== null) {
        let argText = exprText.slice(matchFunctionOpen[0].length);
        const args = [];
        // eslint-disable-next-line no-constant-condition
        while (true) {
            // Function close?
            const matchFunctionClose = argText.match(rCalcFunctionClose);
            if (matchFunctionClose !== null) {
                argText = argText.slice(matchFunctionClose[0].length);
                break;
            }

            // Function argument separator
            if (args.length !== 0) {
                const matchFunctionSeparator = argText.match(rCalcFunctionSeparator);
                if (matchFunctionSeparator === null) {
                    throw new Error(`Syntax error "${argText}"`);
                }
                argText = argText.slice(matchFunctionSeparator[0].length);
            }

            // Get the argument
            const [argExpr, nextArgText] = parseExpression(argText);
            args.push(argExpr);
            argText = nextArgText;
        }

        const fnExpr = {
            'function': {
                'function': matchFunctionOpen[1],
                'arguments': args
            }
        };
        return [fnExpr, argText];
    }

    // Number?
    const matchNumber = exprText.match(rCalcNumber);
    if (matchNumber !== null) {
        const number = parseFloat(matchNumber[1]);
        const expr = {'number': number};
        return [expr, exprText.slice(matchNumber[0].length)];
    }

    // String?
    const matchString = exprText.match(rCalcString);
    if (matchString !== null) {
        const string = matchString[1].replace(rCalcStringUnescape, '$1');
        const expr = {'string': string};
        return [expr, exprText.slice(matchString[0].length)];
    }

    // String (double quotes)?
    const matchStringDouble = exprText.match(rCalcStringDouble);
    if (matchStringDouble !== null) {
        const string = matchStringDouble[1].replace(rCalcStringDoubleUnescape, '$1');
        const expr = {'string': string};
        return [expr, exprText.slice(matchStringDouble[0].length)];
    }

    // Field?
    const matchField = exprText.match(rCalcField);
    if (matchField !== null) {
        const fieldName = matchField[1].replace(rCalcFieldUnescape, '$1');
        const expr = {'field': fieldName};
        return [expr, exprText.slice(matchField[0].length)];
    }

    throw new Error(`Syntax error "${exprText}"`);
}


// Helper function to parse an expression including binary operator sub-expressions
function parseBinaryOperator(exprText, leftExpr) {
    // Match a binary operator - if not found, return the left expression
    const matchBinaryOp = exprText.match(rCalcBinaryOp);
    if (matchBinaryOp === null) {
        return [leftExpr, exprText];
    }

    // Parse the right expression and return the binary operator expression
    const rightText = exprText.slice(matchBinaryOp[0].length);
    const [rightExpr, nextText] = parseExpression(rightText);
    const binExpr = {
        'binary': {
            'operator': matchBinaryOp[1],
            'left': leftExpr,
            'right': rightExpr
        }
    };
    return [binExpr, nextText];
}
