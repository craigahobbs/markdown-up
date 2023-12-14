// Licensed under the MIT License
// https://github.com/craigahobbs/bare-script/blob/main/LICENSE

/** @module lib/runtime */

import {defaultMaxStatements, expressionFunctions, scriptFunctions} from './library.js';


/**
 * The BareScript runtime options
 *
 * @typedef {Object} ExecuteScriptOptions
 * @property {boolean} [debug] - If true, execute in debug mode
 * @property {function} [fetchFn] - The [fetch function]{@link module:lib/runtime~FetchFn}
 * @property {Object} [globals] - The global variables
 * @property {function} [logFn] - The [log function]{@link module:lib/runtime~LogFn}
 * @property {number} [maxStatements] - The maximum number of statements; default is 1e9; 0 for no maximum
 * @property {number} [statementCount] - The current statement count
 * @property {function} [urlFn] - The [URL modifier function]{@link module:lib/runtime~URLFn}
 * @property {string} [systemPrefix] - The system include prefix
 */

/**
 * The fetch function
 *
 * @callback FetchFn
 * @param {string} url - The URL to fetch
 * @param {?Object} [options] - The [fetch options]{@link https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters}
 * @returns {Promise} The fetch promise
 */

/**
 * The log function
 *
 * @callback LogFn
 * @param {string} text - The log text
 */

/**
 * The URL modifier function
 *
 * @callback URLFn
 * @param {string} url - The URL
 * @returns {string} The modified URL
 */


/**
 * Execute a BareScript model
 *
 * @param {Object} script - The [BareScript model]{@link https://craigahobbs.github.io/bare-script/model/#var.vName='BareScript'}
 * @param {Object} [options = {}] - The [script execution options]{@link module:lib/runtime~ExecuteScriptOptions}
 * @returns The script result
 * @throws [BareScriptRuntimeError]{@link module:lib/runtime.BareScriptRuntimeError}
 */
export function executeScript(script, options = {}) {
    // Create the global variable object, if necessary
    let {globals = null} = options;
    if (globals === null) {
        globals = {};
        options.globals = globals;
    }

    // Set the script function globals variables
    for (const scriptFuncName of Object.keys(scriptFunctions)) {
        if (!(scriptFuncName in globals)) {
            globals[scriptFuncName] = scriptFunctions[scriptFuncName];
        }
    }

    // Execute the script
    options.statementCount = 0;
    return executeScriptHelper(script.statements, options, null);
}


export function executeScriptHelper(statements, options, locals) {
    const {globals} = options;

    // Iterate each script statement
    let labelIndexes = null;
    const statementsLength = statements.length;
    for (let ixStatement = 0; ixStatement < statementsLength; ixStatement++) {
        const statement = statements[ixStatement];
        const [statementKey] = Object.keys(statement);

        // Increment the statement counter
        const maxStatements = options.maxStatements ?? defaultMaxStatements;
        if (maxStatements > 0 && ++options.statementCount > maxStatements) {
            throw new BareScriptRuntimeError(`Exceeded maximum script statements (${maxStatements})`);
        }

        // Expression?
        if (statementKey === 'expr') {
            const exprValue = evaluateExpression(statement.expr.expr, options, locals, false);
            if ('name' in statement.expr) {
                if (locals !== null) {
                    locals[statement.expr.name] = exprValue;
                } else {
                    globals[statement.expr.name] = exprValue;
                }
            }

        // Jump?
        } else if (statementKey === 'jump') {
            // Evaluate the expression (if any)
            if (!('expr' in statement.jump) || evaluateExpression(statement.jump.expr, options, locals, false)) {
                // Find the label
                if (labelIndexes !== null && statement.jump.label in labelIndexes) {
                    ixStatement = labelIndexes[statement.jump.label];
                } else {
                    const ixLabel = statements.findIndex((stmt) => stmt.label === statement.jump.label);
                    if (ixLabel === -1) {
                        throw new BareScriptRuntimeError(`Unknown jump label "${statement.jump.label}"`);
                    }
                    if (labelIndexes === null) {
                        labelIndexes = {};
                    }
                    labelIndexes[statement.jump.label] = ixLabel;
                    ixStatement = ixLabel;
                }
            }

        // Return?
        } else if (statementKey === 'return') {
            if ('expr' in statement.return) {
                return evaluateExpression(statement.return.expr, options, locals, false);
            }
            return null;

        // Function?
        } else if (statementKey === 'function') {
            globals[statement.function.name] = (args, fnOptions) => {
                const funcLocals = {};
                if ('args' in statement.function) {
                    const argsLength = args.length;
                    const funcArgsLength = statement.function.args.length;
                    const ixArgLast = (statement.function.lastArgArray ?? null) && (funcArgsLength - 1);
                    for (let ixArg = 0; ixArg < funcArgsLength; ixArg++) {
                        const argName = statement.function.args[ixArg];
                        if (ixArg < argsLength) {
                            funcLocals[argName] = (ixArg === ixArgLast ? args.slice(ixArg) : args[ixArg]);
                        } else {
                            funcLocals[argName] = (ixArg === ixArgLast ? [] : null);
                        }
                    }
                }
                return executeScriptHelper(statement.function.statements, fnOptions, funcLocals);
            };

        // Include?
        } else if (statementKey === 'include') {
            throw new BareScriptRuntimeError(`Include of "${statement.include.includes[0].url}" within non-async scope`);
        }
    }

    return null;
}


/**
 * Evaluate an expression model
 *
 * @param {Object} expr - The [expression model]{@link https://craigahobbs.github.io/bare-script/model/#var.vName='Expression'}
 * @param {?Object} [options = null] - The [script execution options]{@link module:lib/runtime~ExecuteScriptOptions}
 * @param {?Object} [locals = null] - The local variables
 * @param {boolean} [builtins = true] - If true, include the
 *     [built-in expression functions]{@link https://craigahobbs.github.io/bare-script/library/expression.html}
 * @returns The expression result
 * @throws [BareScriptRuntimeError]{@link module:lib/runtime.BareScriptRuntimeError}
 */
export function evaluateExpression(expr, options = null, locals = null, builtins = true) {
    const [exprKey] = Object.keys(expr);
    const globals = (options !== null ? (options.globals ?? null) : null);

    // Number
    if (exprKey === 'number') {
        return expr.number;
    }

    // String
    if (exprKey === 'string') {
        return expr.string;
    }

    // Variable
    if (exprKey === 'variable') {
        // Keywords
        if (expr.variable === 'null') {
            return null;
        } else if (expr.variable === 'false') {
            return false;
        } else if (expr.variable === 'true') {
            return true;
        }

        // Get the local or global variable value or null if undefined
        let varValue = (locals !== null ? locals[expr.variable] : undefined);
        if (typeof varValue === 'undefined') {
            varValue = (globals !== null ? (globals[expr.variable] ?? null) : null);
        }
        return varValue;
    }

    // Function
    if (exprKey === 'function') {
        // "if" built-in function?
        const funcName = expr.function.name;
        if (funcName === 'if') {
            const [valueExpr = null, trueExpr = null, falseExpr = null] = expr.function.args ?? [];
            const value = (valueExpr !== null ? evaluateExpression(valueExpr, options, locals, builtins) : false);
            const resultExpr = (value ? trueExpr : falseExpr);
            return resultExpr !== null ? evaluateExpression(resultExpr, options, locals, builtins) : null;
        }

        // Compute the function arguments
        const funcArgs = 'args' in expr.function
            ? expr.function.args.map((arg) => evaluateExpression(arg, options, locals, builtins))
            : null;

        // Global/local function?
        let funcValue = (locals !== null ? locals[funcName] : undefined);
        if (typeof funcValue === 'undefined') {
            funcValue = (globals !== null ? globals[funcName] : undefined);
            if (typeof funcValue === 'undefined') {
                funcValue = (builtins ? (expressionFunctions[funcName] ?? null) : null);
            }
        }
        if (funcValue !== null) {
            // Async function called within non-async execution?
            if (typeof funcValue === 'function' && funcValue.constructor.name === 'AsyncFunction') {
                throw new BareScriptRuntimeError(`Async function "${funcName}" called within non-async scope`);
            }

            // Call the function
            try {
                return funcValue(funcArgs, options) ?? null;
            } catch (error) {
                // Propogate runtime errors
                if (error instanceof BareScriptRuntimeError) {
                    throw error;
                }

                // Log and return null
                if (options !== null && 'logFn' in options && options.debug) {
                    options.logFn(`BareScript: Function "${funcName}" failed with error: ${error.message}`);
                }
                return null;
            }
        }

        throw new BareScriptRuntimeError(`Undefined function "${funcName}"`);
    }

    // Binary expression
    if (exprKey === 'binary') {
        const binOp = expr.binary.op;
        const leftValue = evaluateExpression(expr.binary.left, options, locals, builtins);

        // Short-circuiting binary operators - evaluate right expression only if necessary
        if (binOp === '&&') {
            return leftValue && evaluateExpression(expr.binary.right, options, locals, builtins);
        } else if (binOp === '||') {
            return leftValue || evaluateExpression(expr.binary.right, options, locals, builtins);
        }

        // Non-short-circuiting binary operators
        const rightValue = evaluateExpression(expr.binary.right, options, locals, builtins);
        if (binOp === '**') {
            return leftValue ** rightValue;
        } else if (binOp === '*') {
            return leftValue * rightValue;
        } else if (binOp === '/') {
            return leftValue / rightValue;
        } else if (binOp === '%') {
            return leftValue % rightValue;
        } else if (binOp === '+') {
            return leftValue + rightValue;
        } else if (binOp === '-') {
            return leftValue - rightValue;
        } else if (binOp === '<=') {
            return leftValue <= rightValue;
        } else if (binOp === '<') {
            return leftValue < rightValue;
        } else if (binOp === '>=') {
            return leftValue >= rightValue;
        } else if (binOp === '>') {
            return leftValue > rightValue;
        } else if (binOp === '==') {
            return leftValue === rightValue;
        }
        // else if (binOp === '!=')
        return leftValue !== rightValue;
    }

    // Unary expression
    if (exprKey === 'unary') {
        const unaryOp = expr.unary.op;
        const value = evaluateExpression(expr.unary.expr, options, locals, builtins);
        if (unaryOp === '!') {
            return !value;
        }
        // else if (unaryOp === '-')
        return -value;
    }

    // Expression group
    // else if (exprKey === 'group')
    return evaluateExpression(expr.group, options, locals, builtins);
}


/**
 * A BareScript runtime error
 *
 * @extends {Error}
 */
export class BareScriptRuntimeError extends Error {
    /**
     * Create a BareScript runtime error
     *
     * @param {string} message - The runtime error message
     */
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}