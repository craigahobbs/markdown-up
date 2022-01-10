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

    # A function definition
    CalcFunction function

    # A label definition
    string label

    # A jump (to label) statement
    string jump

    # A jump-if statement
    CalcJumpIf jumpif

    # A return statement
    CalcExpr return

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


# A calculation language jump-if statement
struct CalcJumpIf

    # The label to jump to
    string label

    # The test expression
    CalcExpr expression


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
    '/': (left, right) => left / right,
    '==': (left, right) => left === right,
    '^': (left, right) => left ** right,
    '>=': (left, right) => left >= right,
    '>': (left, right) => left > right,
    '<=': (left, right) => left <= right,
    '<': (left, right) => left < right,
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
    'encodeURIComponent': ([text]) => encodeURIComponent(text),
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
    'max': (args) => Math.max(...args),
    'mid': ([text, startNum, numChars]) => text.slice(startNum, startNum + numChars),
    'min': (args) => Math.min(...args),
    'minute': ([datetime]) => datetime.getMinutes(),
    'month': ([datetime]) => datetime.getMonth() + 1,
    'now': () => new Date(),
    'pi': () => Math.PI,
    'rand': () => Math.random(),
    'rept': ([text, count]) => text.repeat(count),
    'right': ([text, numChars = 1]) => text.slice(Math.max(0, text.length - numChars)),
    'round': ([number, digits]) => {
        const multiplier = 10 ** digits;
        return Math.round(number * multiplier) / multiplier;
    },
    'second': ([datetime]) => datetime.getSeconds(),
    'sign': ([number]) => Math.sign(number),
    'sin': ([number]) => Math.sin(number),
    'sqrt': ([number]) => Math.sqrt(number),
    'substitute': ([text, oldText, newText]) => text.replaceAll(oldText, newText),
    'text': ([value]) => `${value}`,
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
 * Execute a calculation language script
 *
 * @param {Object} script - The calculation script model
 * @param {Object} [globals = {}] - The global variables
 * @param {number} [maxStatements = 1e9] - The maximum number of statements, 0 for no maximum
 * @returns The calculation script result
 */
export function executeScript(script, globals = {}, maxStatements = 1e9) {
    // The statement counter
    let statementCount = 0;
    const statementCounter = () => {
        if (maxStatements !== 0 && ++statementCount > maxStatements) {
            throw new Error(`Exceeded maximum script statements (${maxStatements})`);
        }
    };

    return executeScriptHelper(script.statements, globals, null, statementCounter);
}


export function executeScriptHelper(statements, globals, locals, statementCounter) {
    // Iterate each script statement
    const labelIndexes = {};
    for (let ixStatement = 0; ixStatement < statements.length; ixStatement++) {
        const statement = statements[ixStatement];

        // Increment the statement counter
        statementCounter();

        // Assignment?
        if ('assignment' in statement) {
            const exprValue = executeCalculation(statement.assignment.expression, globals, locals);
            if (locals !== null) {
                locals[statement.assignment.name] = exprValue;
            } else {
                globals[statement.assignment.name] = exprValue;
            }

        // Function?
        } else if ('function' in statement) {
            const userFunction = (args) => {
                const functionLocals = {};
                if ('arguments' in statement.function) {
                    const argumentNames = statement.function.arguments;
                    for (let ixArg = 0; ixArg < argumentNames.length; ixArg++) {
                        functionLocals[argumentNames[ixArg]] = (ixArg < args.length ? args[ixArg] : null);
                    }
                }
                return executeScriptHelper(statement.function.statements, globals, functionLocals, statementCounter);
            };
            globals[statement.function.name] = userFunction;

        // Jump?
        } else if ('jump' in statement || 'jumpif' in statement) {
            // Evaluate the expression (if any)
            const jumpValue = 'jumpif' in statement ? executeCalculation(statement.jumpif.expression, globals, locals) : true;
            if (jumpValue) {
                // Find the label
                const jumpLabel = 'jumpif' in statement ? statement.jumpif.label : statement.jump;
                let ixJump;
                if (jumpLabel in labelIndexes) {
                    ixJump = labelIndexes[jumpLabel];
                } else {
                    ixJump = statements.findIndex((stmt) => stmt.label === jumpLabel);
                    if (ixJump === -1) {
                        throw new Error(`Jump label "${jumpLabel}" not found`);
                    }
                    labelIndexes[jumpLabel] = ixJump;
                }

                // Set the new execution statement index
                ixStatement = ixJump;
            }

        // Return?
        } else if ('return' in statement) {
            return executeCalculation(statement.return, globals, locals);

        // Expression
        } else if ('expression' in statement) {
            executeCalculation(statement.expression, globals, locals);
        }
    }

    return null;
}


/**
 * Excecute a calculation language model
 *
 * @param {Object} expr - The calculation expression model
 * @param {Object} [globals = {}] - The global variables
 * @param {Object} [locals = null] - The local variables
 * @returns The calculation expression result
 */
export function executeCalculation(expr, globals = {}, locals = null) {
    if ('binary' in expr) {
        const left = executeCalculation(expr.binary.left, globals, locals);
        const right = executeCalculation(expr.binary.right, globals, locals);
        return binaryOperators[expr.binary.operator](left, right);
    } else if ('unary' in expr) {
        const value = executeCalculation(expr.unary.expr, globals, locals);
        return unaryOperators[expr.unary.operator](value);
    } else if ('function' in expr) {
        const funcName = expr.function.name;
        const funcArgs = expr.function.arguments.map((arg) => executeCalculation(arg, globals, locals));

        // Global/local function?
        const funcValue = locals !== null && funcName in locals ? locals[funcName] : (funcName in globals ? globals[funcName] : null);
        if (funcValue !== null) {
            return funcValue(funcArgs);
        }

        // Built-in function?
        if (funcName === 'getGlobal') {
            const [name] = funcArgs;
            return name in globals ? globals[name] : null;
        } else if (funcName === 'setGlobal') {
            const [name, value] = funcArgs;
            globals[name] = value;
            return value;
        } else if (funcName in calcFunctions) {
            return calcFunctions[funcName](funcArgs);
        }
        throw new Error(`Undefined function "${funcName}"`);
    } else if ('variable' in expr) {
        const varName = expr.variable;
        return locals !== null && varName in locals ? locals[expr.variable] : (varName in globals ? globals[varName] : null);
    } else if ('number' in expr) {
        return expr.number;
    }
    // else if ('string' in expr) {
    return expr.string;
}


// Calculation script regex
const rScriptLineSplit = /\r?\n/;
const rScriptContinuation = /\\\s*$/;
const rScriptComment = /^\s*(?:\/\/.*)?$/;
const rScriptAssignment = /^\s*(?<name>[A-Za-z_]\w*)\s*=\s*(?<expr>.*)$/;
const rScriptFunctionBegin = /^function\s+(?<name>[A-Za-z_]\w*)\s*\(\s*(?<args>[A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)?\s*\)\s*$/;
const rScriptFunctionArgSplit = /\s*,\s*/;
const rScriptFunctionEnd = /^endfunction\s*$/;
const rScriptLabel = /^\s*(?<name>[A-Za-z_]\w*)\s*:\s*$/;
const rScriptJump = /^\s*jump\s+(?<name>[A-Za-z_]\w*)\s*$/;
const rScriptJumpIf = /^\s*jumpif\s*\((?<expr>.+)\)\s+(?<name>[A-Za-z_]\w*)\s*$/;
const rScriptReturn = /^\s*return\s+(?<expr>.+)\s*$/;


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
                    'arguments': typeof matchFunctionBegin.groups.args !== 'undefined'
                        ? matchFunctionBegin.groups.args.split(rScriptFunctionArgSplit) : [],
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

        // Label definition?
        const matchLabel = line.match(rScriptLabel);
        if (matchLabel !== null) {
            statements.push({'label': matchLabel.groups.name});
            continue;
        }

        // Jump definition?
        const matchJump = line.match(rScriptJump);
        if (matchJump !== null) {
            statements.push({'jump': matchJump.groups.name});
            continue;
        }

        // JumpIf definition?
        const matchJumpIf = line.match(rScriptJumpIf);
        if (matchJumpIf !== null) {
            statements.push({
                'jumpif': {
                    'label': matchJumpIf.groups.name,
                    'expression': parseCalculation(matchJumpIf.groups.expr)
                }
            });
            continue;
        }

        // Return?
        const matchReturn = line.match(rScriptReturn);
        if (matchReturn !== null) {
            statements.push({
                'return': parseCalculation(matchReturn.groups.expr)
            });
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
const rCalcVariable = /^\s*([A-Za-z_]\w*)/;
const rCalcVariableEx = /^\s*\[\s*((?:\\\]|[^\]])+)\s*\]/;
const rCalcVariableExEscape = /\\([\\\]])/g;


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
        const expr = {'variable': matchVariable[1]};
        return [expr, exprText.slice(matchVariable[0].length)];
    }

    // Variable (brackets)?
    const matchVariableEx = exprText.match(rCalcVariableEx);
    if (matchVariableEx !== null) {
        const variableName = matchVariableEx[1].replace(rCalcVariableExEscape, '$1');
        const expr = {'variable': variableName};
        return [expr, exprText.slice(matchVariableEx[0].length)];
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
