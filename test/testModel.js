// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/* eslint-disable id-length */

import {chartTypes, validateBarChart, validateDataTable, validateLineChart} from '../lib/model.js';
import test from 'ava';


test('testModel.js tests placeholder', (t) => {
    t.true(chartTypes !== null);
    t.true(validateBarChart !== null);
    t.true(validateDataTable !== null);
    t.true(validateLineChart !== null);
});
