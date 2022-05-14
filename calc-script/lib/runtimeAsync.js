// Licensed under the MIT License
// https://github.com/craigahobbs/calc-script/blob/main/LICENSE

/** @module lib/runtimeAsync */

import {defaultMaxStatements, expressionFunctions, scriptFunctions} from './library.js';
import {evaluateExpression, executeScriptHelper, isAsyncExpr} from './runtime.js';
import {parseScript} from './parser.js';


/**
 * Execute a calculation language script.
 *
 * This is the asynchronous form of the [executeScript function]{@link module:lib/runtime.executeScript}.
 * Use this form of the function if you have any global asynchronous functions.
 *
 * @async
 * @param {Object} script - The calculation script model
 * @param {Object} [globals = {}] - The global variables
 * @param {module:lib/runtime~ExecuteScriptOptions} [options = null] - The script execution options
 * @returns The calculation script result
 */
export async function executeScriptAsync(script, globals = {}, options = null) {
    // The statement counter
    let statementCount = 0;
    const maxStatements = (options !== null && 'maxStatements' in options ? options.maxStatements : defaultMaxStatements);
    const statementCounter = () => {
        if (maxStatements !== 0 && ++statementCount > maxStatements) {
            throw new Error(`Exceeded maximum script statements (${maxStatements})`);
        }
    };

    // Execute the script
    const timeBegin = performance.now();
    for (const scriptFuncName of Object.keys(scriptFunctions)) {
        if (!(scriptFuncName in globals)) {
            globals[scriptFuncName] = scriptFunctions[scriptFuncName];
        }
    }
    const result = await executeScriptHelperAsync(script.statements, globals, null, options, statementCounter);

    // Report script duration
    if (options !== null && 'logFn' in options) {
        const timeEnd = performance.now();
        options.logFn(`Script executed in ${(timeEnd - timeBegin).toFixed(1)} milliseconds`);
    }

    return result;
}


async function executeScriptHelperAsync(statements, globals, locals, options, statementCounter) {
    // Iterate each script statement
    const labelIndexes = {};
    const statementsLength = statements.length;
    for (let ixStatement = 0; ixStatement < statementsLength; ixStatement++) {
        const statement = statements[ixStatement];
        const [statementKey] = Object.keys(statement);

        // Increment the statement counter
        statementCounter();

        // Assignment?
        if (statementKey === 'assign') {
            // eslint-disable-next-line no-await-in-loop
            const exprValue = await evaluateExpressionAsync(statement.assign.expr, globals, locals, options);
            if (locals !== null) {
                locals[statement.assign.name] = exprValue;
            } else {
                // eslint-disable-next-line require-atomic-updates
                globals[statement.assign.name] = exprValue;
            }

        // Function?
        } else if (statementKey === 'function') {
            if (statement.function.async) {
                // eslint-disable-next-line require-await
                globals[statement.function.name] = async (args) => {
                    const funcLocals = {};
                    if ('args' in statement.function) {
                        const argsLength = args.length;
                        for (let ixArg = 0; ixArg < statement.function.args.length; ixArg++) {
                            funcLocals[statement.function.args[ixArg]] = (ixArg < argsLength ? args[ixArg] : null);
                        }
                    }
                    return executeScriptHelperAsync(statement.function.statements, globals, funcLocals, options, statementCounter);
                };
            } else {
                globals[statement.function.name] = (args) => {
                    const funcLocals = {};
                    if ('args' in statement.function) {
                        const argsLength = args.length;
                        for (let ixArg = 0; ixArg < statement.function.args.length; ixArg++) {
                            funcLocals[statement.function.args[ixArg]] = (ixArg < argsLength ? args[ixArg] : null);
                        }
                    }
                    return executeScriptHelper(statement.function.statements, globals, funcLocals, options, statementCounter);
                };
            }

        // Jump?
        } else if (statementKey === 'jump') {
            // Evaluate the expression (if any)
            // eslint-disable-next-line no-await-in-loop
            if (!('expr' in statement.jump) || await evaluateExpressionAsync(statement.jump.expr, globals, locals, options)) {
                // Find the label
                if (statement.jump.label in labelIndexes) {
                    ixStatement = labelIndexes[statement.jump.label];
                } else {
                    const ixLabel = statements.findIndex((stmt) => stmt.label === statement.jump.label);
                    if (ixLabel === -1) {
                        throw new Error(`Jump label "${statement.jump.label}" not found`);
                    }
                    labelIndexes[statement.jump.label] = ixLabel;
                    ixStatement = ixLabel;
                }
            }

        // Return?
        } else if (statementKey === 'return') {
            if ('expr' in statement.return) {
                return evaluateExpressionAsync(statement.return.expr, globals, locals, options);
            }
            return null;

        // Expression
        } else if (statementKey === 'expr') {
            // eslint-disable-next-line no-await-in-loop
            await evaluateExpressionAsync(statement.expr.expr, globals, locals, options);

        // Include?
        } else if (statementKey === 'include') {
            if (options !== null && 'fetchFn' in options) {
                /* eslint-disable no-await-in-loop */
                const scriptResponse = await options.fetchFn(statement.include.url);
                if (scriptResponse.ok) {
                    const scriptModel = parseScript(await scriptResponse.text());
                    await executeScriptHelperAsync(scriptModel.statements, globals, null, options, statementCounter);
                }
                /* eslint-enable no-await-in-loop */
            }
        }
    }

    return null;
}


/**
 * Evaluate a calculation language expression model.
 *
 * The asynchronous form of the [executeScript function]{@link module:lib/runtime.evaluateExpression}.
 * Use this form of the function if you have any global asynchronous functions.
 *
 * @async
 * @param {Object} expr - The calculation expression model
 * @param {Object} [globals = {}] - The global variables
 * @param {Object} [locals = null] - The local variables
 * @returns The calculation expression result
 */
export async function evaluateExpressionAsync(expr, globals = {}, locals = null, options = null) {
    // If this expression does not require async then evaluate non-async
    if (!isAsyncExpr(expr, globals, locals)) {
        return evaluateExpression(expr, globals, locals, options);
    }

    const [exprKey] = Object.keys(expr);

    // Number
    if (exprKey === 'number') {
        return expr.number;

    // String
    } else if (exprKey === 'string') {
        return expr.string;

    // Variable
    } else if (exprKey === 'variable') {
        // Keywords
        if (expr.variable === 'null') {
            return null;
        } else if (expr.variable === 'false') {
            return false;
        } else if (expr.variable === 'true') {
            return true;
        }

        // Get the local or global variable value or null if undefined
        let varValue = locals !== null ? locals[expr.variable] : undefined;
        if (typeof varValue === 'undefined') {
            varValue = globals[expr.variable];
            if (typeof varValue === 'undefined') {
                varValue = null;
            }
        }
        return varValue;

    // Function
    } else if (exprKey === 'function') {
        // "if" built-in function?
        const funcName = expr.function.name;
        if (funcName === 'if') {
            const [valueExpr = null, trueExpr = null, falseExpr = null] = expr.function.args;
            const value = (valueExpr !== null ? await evaluateExpressionAsync(valueExpr, globals, locals, options) : false);
            const resultExpr = (value ? trueExpr : falseExpr);
            return resultExpr !== null ? evaluateExpressionAsync(resultExpr, globals, locals, options) : null;
        }

        // Compute the function arguments
        const funcArgs = 'args' in expr.function
            ? await Promise.all(expr.function.args.map((arg) => evaluateExpressionAsync(arg, globals, locals, options)))
            : null;

        // Global/local function?
        let funcValue = locals !== null ? locals[funcName] : undefined;
        if (typeof funcValue === 'undefined') {
            funcValue = globals[funcName];
        }
        if (typeof funcValue !== 'undefined') {
            return funcValue(funcArgs, options);
        }

        // Built-in globals accessor function?
        if (funcName === 'getGlobal') {
            const [name] = funcArgs;
            const value = globals[name];
            return typeof value !== 'undefined' ? value : null;
        } else if (funcName === 'setGlobal') {
            const [name, value] = funcArgs;
            // eslint-disable-next-line require-atomic-updates
            globals[name] = value;
            return value;
        }

        // Built-in function?
        funcValue = expressionFunctions[funcName];
        if (typeof funcValue !== 'undefined') {
            return expressionFunctions[funcName](funcArgs);
        }

        throw new Error(`Undefined function "${funcName}"`);

    // Binary expression
    } else if (exprKey === 'binary') {
        const binOp = expr.binary.op;
        const leftValue = await evaluateExpressionAsync(expr.binary.left, globals, locals);
        if (binOp === '&&') {
            return leftValue && evaluateExpressionAsync(expr.binary.right, globals, locals);
        } else if (binOp === '||') {
            return leftValue || evaluateExpressionAsync(expr.binary.right, globals, locals);
        }

        const rightValue = await evaluateExpressionAsync(expr.binary.right, globals, locals);
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

    // Unary expression
    } else if (exprKey === 'unary') {
        const unaryOp = expr.unary.op;
        const value = await evaluateExpressionAsync(expr.unary.expr, globals, locals);
        if (unaryOp === '!') {
            return !value;
        }
        // else if (unaryOp === '-')
        return -value;
    }

    // Expression group
    // else if (exprKey === 'group')
    return evaluateExpressionAsync(expr.group, globals, locals);
}
