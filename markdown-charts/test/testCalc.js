// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/* eslint-disable id-length */

import {executeCalculation, parseCalculation, validateCalculation} from '../lib/calc.js';
import test from '../ava';


test('executeCalculation', (t) => {
    const calc = validateCalculation({
        'binary': {
            'operator': '+',
            'left': {'literal': {'number': 7}},
            'right': {
                'binary': {
                    'operator': '*',
                    'left': {'literal': {'number': 3}},
                    'right': {
                        'function': {
                            'function': 'ceil',
                            'arguments': [
                                {'field': 'fieldName'}
                            ]
                        }
                    }
                }
            }
        }
    });
    t.is(executeCalculation(calc, {'fieldName': 3.5}), 19);
});


test('parseCalculation', (t) => {
    const expr = parseCalculation('7 + 3 * 5');
    t.deepEqual(validateCalculation(expr), {
        'binary': {
            'operator': '+',
            'left': {'literal': {'number': 7}},
            'right': {
                'binary': {
                    'operator': '*',
                    'left': {'literal': {'number': 3}},
                    'right': {'literal': {'number': 5}}
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
                    'left': {'literal': {'number': 7}},
                    'right': {'literal': {'number': 3}}
                }
            },
            'right': {'literal': {'number': 5}}
        }
    });
    t.is(executeCalculation(expr), 50);
});
