// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/* eslint-disable id-length */

import {lineChartCodeBlock, lineChartElements} from '../lib/lineChart.js';
import test from 'ava';


test('testLineChart.js tests placeholder', (t) => {
    t.true(lineChartCodeBlock !== null);
    t.true(lineChartElements !== null);
});
