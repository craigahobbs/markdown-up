// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/calc */

import {SchemaMarkdownParser} from '../../schema-markdown/lib/parser.js';
import {validateType} from '../../schema-markdown/lib/schema.js';


// The calc model's Schema Markdown
const calcModelSmd = `\
# The calculation script model
struct CalcScript

    # The calculation script's statements
    CalcStatement[] statements


# A calculation language statement
union CalcStatement

    # A variable assignment
    CalcVariableAssignment assignment

    # A function
    CalcFunction function

    # An expression
    CalcExpr expression


# A calculation language variable assignment statement
struct CalcVariableAssignment

    # The variable name
    string name

    # The expression to assign to the variable
    CalcExpr expression


# A calculation language function statement
struct CalcFunction

    # The function name
    string name

    # The function's argument names
    optional string[len > 0] arguments

    # The function's statements
    CalcStatement[] statements


# A calculation language expression
union CalcExpr

    # A binary expression
    CalcExprBinary binary

    # A unary expression
    CalcExprUnary unary

    # A function expression
    CalcExprFunction function

    # A variable value
    string variable

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

    # The function name
    string name

    # The function arguments
    optional CalcExpr[] arguments
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


/**
 * Validate a calculation script model
 *
 * @param {Object} script - The calculation script model
 * @returns {Object} The validated calculation script model
 */
export function validateScript(script) {
    return validateType(calcModel.types, 'CalcScript', script);
}


/**
 * Validate a calculation expression model
 *
 * @param {Object} expr - The calculation expression model
 * @returns {Object} The validated calculation expression model
 */
export function validateCalculation(expr) {
    return validateType(calcModel.types, 'CalcExpr', expr);
}


// Binary operator map (op => fn)
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


// Unary operator map (op => fn)
const unaryOperators = {
    '-': (value) => -value,
    '!': (value) => !value
};


// Function map (name => fn)
const calcFunctions = {
    'abs': ([number]) => Math.abs(number),
    'acos': ([number]) => Math.acos(number),
    'asin': ([number]) => Math.asin(number),
    'atan': ([number]) => Math.atan(number),
    'atan2': ([number]) => Math.atan2(number),
    'ceil': ([number]) => Math.ceil(number),
    'cos': ([number]) => Math.cos(number),
    'date': ([year, month, day]) => new Date(year, month - 1, day),
    'day': ([datetime]) => datetime.getDate(),
    'find': ([findText, withinText]) => withinText.indexOf(findText),
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
    'rept': ([text, count]) => text.repeat(count),
    'right': ([text, numChars = 1]) => text.slice(numChars),
    'round': ([number, digits]) => {
        const multiplier = 10 ** digits;
        return Math.round(number * multiplier) / multiplier;
    },
    'second': ([datetime]) => datetime.getSeconds(),
    'sign': ([number]) => Math.sign(number),
    'sin': ([number]) => Math.sin(number),
    'sqrt': ([number]) => Math.sqrt(number),
    'substitute': ([text, oldText, newText]) => text.replaceAll(oldText, newText),
    't': ([value]) => `${value}`,
    'tan': ([number]) => Math.tan(number),
    'today': () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    },
    'trim': ([text]) => text.trim(),
    'upper': ([text]) => text.toUpperCase(),
    'value': ([text]) => parseFloat(text),
    'year': ([datetime]) => datetime.getFullYear()
};


/**
 * A calculation variable getter function
 *
 * @callback VariableGetter
 * @param {string} name - The variable name
 * @returns The variable value
 */


/**
 * A calculation variable setter function
 *
 * @callback VariableSetter
 * @param {string} name - The variable name
 * @param value - The variable value
 */


/**
 * Execute a calculation language script
 *
 * @param {Object} script - The calculation script model
 * @param {module:lib/calc~VariableGetter} [getVariable = null] - The variable getter function
 * @param {module:lib/calc~VariableSetter} [setVariable = null] - The variable setter function
 * @returns The calculation script result
 */
export function executeScript(script, getVariable = null, setVariable = null) {
    let result = null;

    // The script variable getter function
    const variables = {};
    const getScriptVariable = (name) => {
        if (name in variables) {
            return variables[name];
        } else if (getVariable !== null) {
            return getVariable(name);
        }
        return null;
    };

    // Iterate each script statement
    for (const statement of script.statements) {
        // Assignment?
        if ('assignment' in statement) {
            // Compute the assignment expression result
            result = executeCalculation(statement.assignment.expression, getScriptVariable);

            // Set the variable - store in local scope if no setter provided
            if (setVariable !== null) {
                setVariable(statement.assignment.name, result);
            } else {
                variables[statement.assignment.name] = result;
            }

        // Function?
        } else if ('function' in statement) {
            // Create the user function
            const userFunction = (args) => {
                // Create the function variable scope
                const functionVariables = {};
                if ('arguments' in statement.function) {
                    const argNames = statement.function.arguments;
                    for (let ixArg = 0; ixArg < argNames.length; ixArg++) {
                        variables[argNames[ixArg]] = ixArg < args.length ? args[ixArg] : null;
                    }
                }
                const getFunctionVariable = (name) => {
                    if (name in functionVariables) {
                        return functionVariables[name];
                    }
                    return getScriptVariable(name);
                };
                const setFunctionVariable = (name, value) => {
                    functionVariables[name] = value;
                };

                // Execute the function statements
                return executeScript(statement.function, getFunctionVariable, setFunctionVariable);
            };

            // Set the function variable - store in local scope if no setter provided
            if (setVariable !== null) {
                setVariable(statement.function.name, userFunction);
            } else {
                variables[statement.function.name] = userFunction;
            }

        // Expression
        } else {
            // if ('expression' in statement)
            result = executeCalculation(statement.expression, getScriptVariable);
        }
    }

    return result;
}


/**
 * Excecute a calculation language model
 *
 * @param {Object} expr - The calculation expression model
 * @param {module:lib/calc~VariableGetter} [getVariable = null] - The variable getter function
 * @returns The calculation expression result
 */
export function executeCalculation(expr, getVariable = null) {
    if ('binary' in expr) {
        return binaryOperators[expr.binary.operator](
            executeCalculation(expr.binary.left, getVariable),
            executeCalculation(expr.binary.right, getVariable)
        );
    } else if ('unary' in expr) {
        return unaryOperators[expr.unary.operator](
            executeCalculation(expr.unary.expr, getVariable)
        );
    } else if ('function' in expr) {
        const functionName = expr.function.name;
        let functionValue = getVariable !== null ? getVariable(functionName) : null;
        if (functionValue === null) {
            if (!(functionName in calcFunctions)) {
                throw new Error(`Undefined function "${functionName}"`);
            }
            functionValue = calcFunctions[functionName];
        }
        return functionValue(expr.function.arguments.map((arg) => executeCalculation(arg, getVariable)));
    } else if ('variable' in expr) {
        return getVariable !== null ? getVariable(expr.variable) : null;
    } else if ('number' in expr) {
        return expr.number;
    }
    // else if ('string' in expr) {
    return expr.string;
}


// Calculation script regex
const rScriptLineSplit = /\r?\n/;
const rScriptContinuation = /\\\s*$/;
const rScriptComment = /^\s*(?:#.*)?$/;
const rScriptAssignment = /^\s*(?<name>[A-Za-z_]\w*)\s*=\s*(?<expr>.*)$/;
const rScriptFunctionBegin = /^function\s+(?<name>[A-Za-z_]\w*)\s*\(\s*(?<args>[A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)\s*\)\s*$/;
const rScriptFunctionArgSplit = /\s*,\s*/;
const rScriptFunctionEnd = /^endfunction\s*$/;


/**
 * Parse a calculation script
 *
 * @param {string|string[]} scriptText - The calculation script text
 * @returns {Object} The calculation script model
 */
export function parseScript(scriptText) {
    const script = {'statements': []};

    // Process each line
    const lines = Array.isArray(scriptText) ? scriptText : scriptText.split(rScriptLineSplit);
    const lineContinuation = [];
    let functionDef = null;
    for (const linePart of lines) {
        const statements = (functionDef !== null ? functionDef.function.statements : script.statements);

        // Line continuation?
        const linePartNoContinuation = linePart.replace(rScriptContinuation, '');
        if (lineContinuation.length || linePartNoContinuation !== linePart) {
            lineContinuation.push(linePartNoContinuation);
        }
        if (linePartNoContinuation !== linePart) {
            continue;
        }
        let line;
        if (lineContinuation.length) {
            line = lineContinuation.join('');
            lineContinuation.length = 0;
        } else {
            line = linePart;
        }

        // Comment?
        if (line.match(rScriptComment) !== null) {
            continue;
        }

        // Assignment?
        const matchAssignment = line.match(rScriptAssignment);
        if (matchAssignment !== null) {
            statements.push({
                'assignment': {
                    'name': matchAssignment.groups.name,
                    'expression': parseCalculation(matchAssignment.groups.expr)
                }
            });
            continue;
        }

        // Function definition begin?
        const matchFunctionBegin = line.match(rScriptFunctionBegin);
        if (matchFunctionBegin !== null) {
            // Nested function definitions are not allowed
            if (functionDef !== null) {
                throw new Error(`Nested function definition "${line}"`);
            }

            // Add the function definition statement
            functionDef = {
                'function': {
                    'name': matchFunctionBegin.groups.name,
                    'arguments': matchFunctionBegin.groups.args.split(rScriptFunctionArgSplit),
                    'statements': []
                }
            };
            statements.push(functionDef);
            continue;
        }

        // Function definition end?
        const matchFunctionEnd = line.match(rScriptFunctionEnd);
        if (matchFunctionEnd !== null) {
            if (functionDef === null) {
                throw new Error('Invalid function end statement (no matching function definition)');
            }
            functionDef = null;
            continue;
        }

        // Expression
        statements.push({'expression': parseCalculation(line)});
    }

    return script;
}


// Calculation language expression regex
const rCalcBinaryOp = new RegExp(`^\\s*(${Object.keys(binaryOperators).map((op) => op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);
const rCalcUnaryOp = new RegExp(`^\\s*(${Object.keys(unaryOperators).join('|')})`);
const rCalcFunctionOpen = /^\s*([A-Za-z_]\w+)\s*\(/;
const rCalcFunctionSeparator = /^\s*,/;
const rCalcFunctionClose = /^\s*\)/;
const rCalcGroupOpen = /^\s*\(/;
const rCalcGroupClose = /^\s*\)/;
const rCalcNumber = /^\s*([+-]?\d+(?:\.\d*)?)/;
const rCalcString = /^\s*'((?:\\'|[^'])*)'/;
const rCalcStringEscape = /\\([\\'])/g;
const rCalcStringDouble = /^\s*"((?:\\"|[^"])*)"/;
const rCalcStringDoubleEscape = /\\([\\"])/g;
const rCalcVariable = /^\s*\[\s*((?:\\\]|[^\]])+)\s*\]/;
const rCalcVariableEscape = /\\([\\\]])/g;


/**
 * Parse a calculation language expression
 *
 * @param {string} exprText - The calculation language expression
 * @returns {Object} The calculation expression model
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
        return [expr, nextText.slice(matchGroupClose[0].length)];
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
                'name': matchFunctionOpen[1],
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
        const string = matchString[1].replace(rCalcStringEscape, '$1');
        const expr = {'string': string};
        return [expr, exprText.slice(matchString[0].length)];
    }

    // String (double quotes)?
    const matchStringDouble = exprText.match(rCalcStringDouble);
    if (matchStringDouble !== null) {
        const string = matchStringDouble[1].replace(rCalcStringDoubleEscape, '$1');
        const expr = {'string': string};
        return [expr, exprText.slice(matchStringDouble[0].length)];
    }

    // Variable?
    const matchVariable = exprText.match(rCalcVariable);
    if (matchVariable !== null) {
        const variableName = matchVariable[1].replace(rCalcVariableEscape, '$1');
        const expr = {'variable': variableName};
        return [expr, exprText.slice(matchVariable[0].length)];
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
