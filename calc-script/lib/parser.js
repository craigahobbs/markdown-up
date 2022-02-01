// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/parser */

import {calcModel} from './runtime.js';


// Calculation script regex
const rScriptLineSplit = /\r?\n/;
const rScriptContinuation = /\\\s*$/;
const rScriptComment = /^\s*(?:\/\/.*)?$/;
const rScriptAssignment = /^\s*(?<name>[A-Za-z_]\w*)\s*=\s*(?<expr>.*)$/;
const rScriptFunctionBegin = /^function\s+(?<name>[A-Za-z_]\w*)\s*\(\s*(?<args>[A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)?\s*\)\s*$/;
const rScriptFunctionArgSplit = /\s*,\s*/;
const rScriptFunctionEnd = /^endfunction\s*$/;
const rScriptLabel = /^\s*(?<name>[A-Za-z_]\w*)\s*:\s*$/;
const rScriptJump = /^\s*jump(?:if\s*\((?<expr>.+)\))?\s+(?<name>[A-Za-z_]\w*)\s*$/;
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
                    'expression': parseExpression(matchAssignment.groups.expr)
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
            const jumpStatement = {'jump': {'label': matchJump.groups.name}};
            if (typeof matchJump.groups.expr !== 'undefined') {
                jumpStatement.jump.expression = parseExpression(matchJump.groups.expr);
            }
            statements.push(jumpStatement);
            continue;
        }

        // Return?
        const matchReturn = line.match(rScriptReturn);
        if (matchReturn !== null) {
            statements.push({
                'return': parseExpression(matchReturn.groups.expr)
            });
            continue;
        }

        // Expression
        statements.push({'expression': parseExpression(line)});
    }

    return script;
}


// Calculation language expression regex
const binaryOpValues = calcModel.types.CalcExprBinaryOperator.enum.values.map((op) => op.name);
const rCalcBinaryOp = new RegExp(`^\\s*(${binaryOpValues.map((op) => op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);
const unaryOpValues = calcModel.types.CalcExprUnaryOperator.enum.values.map((op) => op.name);
const rCalcUnaryOp = new RegExp(`^\\s*(${unaryOpValues.join('|')})`);
const rCalcFunctionOpen = /^\s*([A-Za-z_]\w+)\s*\(/;
const rCalcFunctionSeparator = /^\s*,/;
const rCalcFunctionClose = /^\s*\)/;
const rCalcGroupOpen = /^\s*\(/;
const rCalcGroupClose = /^\s*\)/;
const rCalcNumber = /^\s*([+-]?\d+(?:\.\d*)?(?:e[+-]\d+)?)/;
const rCalcString = /^\s*'((?:\\'|[^'])*)'/;
const rCalcStringEscape = /\\([\\'])/g;
const rCalcStringDouble = /^\s*"((?:\\"|[^"])*)"/;
const rCalcStringDoubleEscape = /\\([\\"])/g;
const rCalcVariable = /^\s*([A-Za-z_]\w*)/;
const rCalcVariableEx = /^\s*\[\s*((?:\\\]|[^\]])+)\s*\]/;
const rCalcVariableExEscape = /\\([\\\]])/g;


// Binary operator re-order map
const binaryReorder = {
    '**': new Set(['*', '/', '%', '+', '-', '<=', '<', '>=', '>', '==', '!=', '&&', '||']),
    '*': new Set(['+', '-', '<=', '<', '>=', '>', '==', '!=', '&&', '||']),
    '/': new Set(['+', '-', '<=', '<', '>=', '>', '==', '!=', '&&', '||']),
    '%': new Set(['+', '-', '<=', '<', '>=', '>', '==', '!=', '&&', '||']),
    '+': new Set(['<=', '<', '>=', '>', '==', '!=', '&&', '||']),
    '-': new Set(['<=', '<', '>=', '>', '==', '!=', '&&', '||']),
    '<=': new Set(['==', '!=', '&&', '||']),
    '<': new Set(['==', '!=', '&&', '||']),
    '>=': new Set(['==', '!=', '&&', '||']),
    '>': new Set(['==', '!=', '&&', '||']),
    '==': new Set(['&&', '||']),
    '!=': new Set(['&&', '||']),
    '&&': new Set(['||']),
    '||': new Set([])
};


/**
 * Parse a calculation language expression
 *
 * @param {string} exprText - The calculation language expression
 * @returns {Object} The calculation expression model
 */
export function parseExpression(exprText) {
    const [expr, nextText] = parseBinaryExpression(exprText);
    if (nextText.trim() !== '') {
        throw new Error(`Syntax error "${nextText}"`);
    }
    return expr;
}


// Helper function to parse a binary operator expression chain
function parseBinaryExpression(exprText, binLeftExpr = null) {
    // Parse the binary operator's left unary expression if none was passed
    let leftExpr;
    let binText;
    if (binLeftExpr !== null) {
        binText = exprText;
        leftExpr = binLeftExpr;
    } else {
        [leftExpr, binText] = parseUnaryExpression(exprText);
    }

    // Match a binary operator - if not found, return the left expression
    const matchBinaryOp = binText.match(rCalcBinaryOp);
    if (matchBinaryOp === null) {
        return [leftExpr, binText];
    }
    const [, binOp] = matchBinaryOp;
    const rightText = binText.slice(matchBinaryOp[0].length);

    // Parse the right sub-expression
    const [rightExpr, nextText] = parseUnaryExpression(rightText);

    // Create the binary expression - re-order for binary operators as necessary
    let binExpr;
    if ('binary' in leftExpr && binaryReorder[binOp].has(leftExpr.binary.operator)) {
        // Left expression has lower precendence - find where to put this expression within the left expression
        binExpr = leftExpr;
        let reorderExpr = leftExpr;
        while ('binary' in reorderExpr.binary.right && binaryReorder[binOp].has(reorderExpr.binary.right.binary.operator)) {
            reorderExpr = reorderExpr.binary.right;
        }
        reorderExpr.binary.right = {'binary': {'operator': binOp, 'left': reorderExpr.binary.right, 'right': rightExpr}};
    } else {
        binExpr = {'binary': {'operator': binOp, 'left': leftExpr, 'right': rightExpr}};
    }

    // Parse the next binary expression in the chain
    return parseBinaryExpression(nextText, binExpr);
}


// Helper function to parse a unary expression
function parseUnaryExpression(exprText) {
    // Group open?
    const matchGroupOpen = exprText.match(rCalcGroupOpen);
    if (matchGroupOpen !== null) {
        const groupText = exprText.slice(matchGroupOpen[0].length);
        const [expr, nextText] = parseBinaryExpression(groupText);
        const matchGroupClose = nextText.match(rCalcGroupClose);
        if (matchGroupClose === null) {
            throw new Error(`Unmatched parenthesis "${exprText}"`);
        }
        return [{'group': expr}, nextText.slice(matchGroupClose[0].length)];
    }

    // Unary operator?
    const matchUnary = exprText.match(rCalcUnaryOp);
    if (matchUnary !== null) {
        const unaryText = exprText.slice(matchUnary[0].length);
        const [expr, nextText] = parseUnaryExpression(unaryText);
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
            const [argExpr, nextArgText] = parseBinaryExpression(argText);
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