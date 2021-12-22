// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/* eslint-disable id-length */

import {executeCalculation, executeScript, parseCalculation, parseScript, validateCalculation, validateScript} from '../lib/calc.js';
import test from '../ava';


test('executeScript', (t) => {
    const script = validateScript({
        'statements': [
            {'assignment': {'name': 'a', 'expression': {'number': 5}}},
            {'assignment': {'name': 'b', 'expression': {'number': 7}}},
            {'expression': {'binary': {'operator': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}}
        ]
    });
    t.is(executeScript(script), 12);
});


test('executeScript, function', (t) => {
    const script = validateScript({
        'statements': [
            {
                'function': {
                    'name': 'multiplyNumbers',
                    'arguments': ['a', 'b'],
                    'statements': [
                        {'expression': {'binary': {'operator': '*', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}}
                    ]
                }
            },
            {'expression': {'function': {'name': 'multiplyNumbers', 'arguments': [{'number': 5}, {'number': 7}]}}}
        ]
    });
    t.is(executeScript(script), 35);
});


test('executeScript, jump', (t) => {
    const script = validateScript({
        'statements': [
            {'assignment': {'name': 'a', 'expression': {'number': 5}}},
            {'jump': 'lab2'},
            {'label': 'lab'},
            {'assignment': {'name': 'a', 'expression': {'number': 6}}},
            {'jump': 'lab3'},
            {'label': 'lab2'},
            {'assignment': {'name': 'a', 'expression': {'number': 7}}},
            {'jump': 'lab'},
            {'label': 'lab3'},
            {'expression': {'variable': 'a'}}
        ]
    });
    t.is(executeScript(script), 6);
});


test('executeScript, jumpif', (t) => {
    const script = validateScript({
        'statements': [
            {'assignment': {'name': 'n', 'expression': {'number': 10}}},
            {'assignment': {'name': 'i', 'expression': {'number': 0}}},
            {'assignment': {'name': 'a', 'expression': {'number': 0}}},
            {'assignment': {'name': 'b', 'expression': {'number': 1}}},
            {'label': 'fib'},
            {'jumpif': {
                'label': 'fibend',
                'expression': {'binary': {'operator': '>=', 'left': {'variable': 'i'}, 'right': {'variable': 'n'}}}
            }},
            {'assignment': {'name': 'tmp', 'expression': {'variable': 'b'}}},
            {'assignment': {
                'name': 'b',
                'expression': {'binary': {'operator': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}
            }},
            {'assignment': {'name': 'a', 'expression': {'variable': 'tmp'}}},
            {'assignment': {'name': 'i', 'expression': {'binary': {'operator': '+', 'left': {'variable': 'i'}, 'right': {'number': 1}}}}},
            {'jump': 'fib'},
            {'label': 'fibend'},
            {'expression': {'variable': 'a'}}
        ]
    });
    t.is(executeScript(script), 55);
});


test('executeScript, maxStatements', (t) => {
    const script = validateScript({
        'statements': [
            {'expression': {'variable': 'a'}},
            {'expression': {'variable': 'b'}},
            {'expression': {'variable': 'c'}}
        ]
    });
    let errorMessage = null;
    try {
        executeScript(script, null, null, 2);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, 'Maximum number of script statements exceeded (2)');
    t.is(executeScript(script, null, null, 3), null);
    t.is(executeScript(script, null, null, 0), null);
});


test('executeCalculation', (t) => {
    const calc = validateCalculation({
        'binary': {
            'operator': '+',
            'left': {'number': 7},
            'right': {
                'binary': {
                    'operator': '*',
                    'left': {'number': 3},
                    'right': {
                        'function': {
                            'name': 'ceil',
                            'arguments': [
                                {'variable': 'varName'}
                            ]
                        }
                    }
                }
            }
        }
    });
    const variables = {'varName': 4};
    const getVariable = (name) => (name in variables ? variables[name] : null);
    t.is(executeCalculation(calc, getVariable), 19);
});


test('executeCalculation, function variable', (t) => {
    const calc = validateCalculation({
        'function': {
            'name': 'fnName',
            'arguments': [
                {'number': 3}
            ]
        }
    });
    const variables = {'fnName': ([number]) => 2 * number};
    const getVariable = (name) => (name in variables ? variables[name] : null);
    t.is(executeCalculation(calc, getVariable), 6);
});


test('executeCalculation, function unknown', (t) => {
    const calc = validateCalculation({
        'function': {
            'name': 'fnUnknown',
            'arguments': []
        }
    });
    const variables = {};
    const getVariable = (name) => (name in variables ? variables[name] : null);
    let errorMessage = null;
    try {
        executeCalculation(calc, getVariable);
    } catch ({message}) {
        errorMessage = message;
    }
    t.is(errorMessage, 'Undefined function "fnUnknown"');
});


test('parseScript, jumpif', (t) => {
    const script = validateScript(parseScript(`
n = 10
i = 0
a = 0
b = 1

fib:
    jumpif (i >= [n]) fibend
    tmp = b
    b = a + b
    a = tmp
    i = i + 1
    jump fib
fibend:

a
`));
    t.deepEqual(script, {
        'statements': [
            {'assignment': {'name': 'n', 'expression': {'number': 10}}},
            {'assignment': {'name': 'i', 'expression': {'number': 0}}},
            {'assignment': {'name': 'a', 'expression': {'number': 0}}},
            {'assignment': {'name': 'b', 'expression': {'number': 1}}},
            {'label': 'fib'},
            {
                'jumpif': {
                    'label': 'fibend',
                    'expression': {'binary': {'operator': '>=', 'left': {'variable': 'i'}, 'right': {'variable': 'n'}}}
                }
            },
            {'assignment': {'name': 'tmp', 'expression': {'variable': 'b'}}},
            {
                'assignment': {
                    'name': 'b',
                    'expression': {'binary': {'operator': '+', 'left': {'variable': 'a'}, 'right': {'variable': 'b'}}}
                }
            },
            {'assignment': {'name': 'a', 'expression': {'variable': 'tmp'}}},
            {
                'assignment': {
                    'name': 'i',
                    'expression': {'binary': {'operator': '+', 'left': {'variable': 'i'}, 'right': {'number': 1}}}
                }
            },
            {'jump': 'fib'},
            {'label': 'fibend'},
            {'expression': {'variable': 'a'}}
        ]
    });
    t.is(executeScript(script), 55);
});


test('parseCalculation', (t) => {
    const expr = parseCalculation('7 + 3 * 5');
    t.deepEqual(validateCalculation(expr), {
        'binary': {
            'operator': '+',
            'left': {'number': 7},
            'right': {
                'binary': {
                    'operator': '*',
                    'left': {'number': 3},
                    'right': {'number': 5}
                }
            }
        }
    });
    t.is(executeCalculation(expr), 22);
});


test('parseCalculation, group', (t) => {
    const expr = parseCalculation('(7 + 3) * 5');
    t.deepEqual(validateCalculation(expr), {
        'binary': {
            'operator': '*',
            'left': {
                'binary': {
                    'operator': '+',
                    'left': {'number': 7},
                    'right': {'number': 3}
                }
            },
            'right': {'number': 5}
        }
    });
    t.is(executeCalculation(expr), 50);
});


test('parseCalculation, group nested', (t) => {
    const expr = parseCalculation('(1 + (2))');
    t.deepEqual(validateCalculation(expr), {
        'binary': {
            'operator': '+',
            'left': {'number': 1},
            'right': {'number': 2}
        }
    });
    t.is(executeCalculation(expr), 3);
});


test('parseCalculation, string literal', (t) => {
    const expr = parseCalculation("'abc'");
    t.deepEqual(validateCalculation(expr), {'string': 'abc'});
    t.is(executeCalculation(expr), 'abc');
});


test('parseCalculation, string literal escapes', (t) => {
    const expr = parseCalculation("'ab \\'c\\' d\\\\e \\f'");
    t.deepEqual(validateCalculation(expr), {'string': "ab 'c' d\\e \\f"});
    t.is(executeCalculation(expr), "ab 'c' d\\e \\f");
});


test('parseCalculation, string literal double-quote', (t) => {
    const expr = parseCalculation('"abc"');
    t.deepEqual(validateCalculation(expr), {'string': 'abc'});
    t.is(executeCalculation(expr), 'abc');
});


test('parseCalculation, string literal double-quote escapes', (t) => {
    const expr = parseCalculation('"ab \\"c\\" d\\\\e \\f"');
    t.deepEqual(validateCalculation(expr), {'string': 'ab "c" d\\e \\f'});
    t.is(executeCalculation(expr), 'ab "c" d\\e \\f');
});
