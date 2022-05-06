// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/* eslint-disable id-length */

import {chartCodeBlock, compareValues, formatValue, parameterValue, valueParameter} from '../lib/util.js';
import test from 'ava';


test('testScript.js tests placeholder', (t) => {
    t.true(chartCodeBlock !== null);
    t.true(compareValues !== null);
    t.true(formatValue !== null);
    t.true(parameterValue !== null);
    t.true(valueParameter !== null);
});
