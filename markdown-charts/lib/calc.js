// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/calc */

import {getReferencedTypes, validateType} from '../../schema-markdown/lib/schema.js';
import {SchemaMarkdownParser} from '../../schema-markdown/lib/parser.js';
import {chartModelSmd} from './model.js';
import {getFieldValue} from './util.js';


// The calc model's Schema Markdown
const calcModelSmd = `\
# The calculation language expression specification
union CalcExpr

    # A literal
    FieldValue literal

    # A binary expression
    CalcExprBinary binary

    # A unary expression
    CalcExprUnary unary

    # A function expression
    CalcExprFunction function

    # A field value
    string field


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
const calcParser = new SchemaMarkdownParser();
calcParser.parseString(chartModelSmd, 'chartModel.smd', false);
calcParser.parseString(calcModelSmd, 'calcModel.smd');
export const calcModel = {
    'title': 'The Calculation Language Model',
    'types': getReferencedTypes(calcParser.types, 'CalcExpr')
};


// Function map (name => fn)
const calcFunctions = {
    'abs': ([number]) => Math.abs(number),
    'ceil': ([number]) => Math.ceil(number),
    'date': ([year, month, day]) => new Date(year, month - 1, day),
    'day': () => 0,
    'fixed': () => 0,
    'floor': ([number]) => Math.floor(number),
    'hour': () => 0,
    'if': ([condition, valueTrue, valueFalse]) => (condition ? valueTrue : valueFalse),
    'left': () => 0,
    'len': ([text]) => text.length,
    'lower': ([text]) => text.toLowerCase(),
    'ln': ([number]) => Math.log(number),
    'log': () => 0,
    'log10': ([number]) => Math.log10(number),
    'mid': ([text, startNum, numChars]) => text.slice(startNum, startNum + numChars),
    'minute': () => 0,
    'month': ([datetime]) => datetime.getMonth() + 1,
    'mround': () => 0,
    'now': () => new Date(),
    'rand': () => Math.random(),
    'replace': () => 0,
    'rept': () => 0,
    'right': () => 0,
    'round': () => 0,
    'second': () => 0,
    'search': () => 0,
    'sign': ([number]) => Math.sign(number),
    'sqrt': ([number]) => Math.sqrt(number),
    'substitute': () => 0,
    'text': () => 0,
    'today': () => 0,
    'trim': () => 0,
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
 * @returns {string|number|Date|boolean|null} The calculation result
 */
export function executeCalculation(expr, row = null) {
    if ('literal' in expr) {
        return getFieldValue(expr.literal);
    } else if ('binary' in expr) {
        return binaryOperators[expr.binary.operator](executeCalculation(expr.binary.left, row), executeCalculation(expr.binary.right, row));
    } else if ('unary' in expr) {
        return unaryOperators[expr.unary.operator](executeCalculation(expr.unary.expr, row));
    } else if ('function' in expr) {
        return calcFunctions[expr.function.function](expr.function.arguments.map((arg) => executeCalculation(arg, row)));
    }
    // else if ('field' in expr)
    return expr.field in row ? row[expr.field] : null;
}


// Calculation language expression regex
const rCalcBinaryOp = new RegExp(`^\\s*(${Object.keys(binaryOperators).map((op) => op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);
const rCalcUnaryOp = new RegExp(`^\\s*(${Object.keys(unaryOperators).map((op) => op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);
const rCalcFunctionOpen = new RegExp(
    `^\\s*(${Object.keys(calcFunctions).map((op) => op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\s*\\(`
);
const rCalcFunctionSeparator = /^\s*,/;
const rCalcFunctionClose = /^\s*\)/;
const rCalcGroupOpen = /^\s*\(/;
const rCalcGroupClose = /^\s*\)/;
const rCalcNumber = /^\s*([+-]?\d+(?:\.\d*)?)/;
const rCalcField = /^\s*\[\s*(.+?)\s*\]/;


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
    // Match a sub-expression
    const matchGroupOpen = exprText.match(rCalcGroupOpen);
    const matchUnary = exprText.match(rCalcUnaryOp);
    const matchFunctionOpen = exprText.match(rCalcFunctionOpen);
    const matchNumber = exprText.match(rCalcNumber);
    const matchString = null;
    const matchField = exprText.match(rCalcField);

    // Group open?
    if (matchGroupOpen !== null) {
        const groupText = exprText.slice(matchGroupOpen[0].length);
        const [expr, nextText] = parseExpression(groupText);
        const matchGroupClose = nextText.match(rCalcGroupClose);
        if (matchGroupClose === null) {
            throw new Error(`Unmatched parenthesis "${exprText}"`);
        }
        return [expr, nextText.slice(matchGroupOpen[0].length)];

    // Unary operator?
    } else if (matchUnary !== null) {
        const unaryText = exprText.slice(matchUnary[0].length);
        const [expr, nextText] = parseSubExpression(unaryText);
        const unaryExpr = {
            'unary': {
                'operator': matchUnary[1],
                expr
            }
        };
        return [unaryExpr, nextText];

    // Function?
    } else if (matchFunctionOpen !== null) {
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

    // Number?
    } else if (matchNumber !== null) {
        const expr = {'literal': {'number': parseFloat(matchNumber[1])}};
        return [expr, exprText.slice(matchNumber[0].length)];

    // String?
    } else if (matchString !== null) {

    // Field?
    } else if (matchField !== null) {
        const expr = {'field': matchField[1]};
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
