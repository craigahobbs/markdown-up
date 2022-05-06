// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/* eslint-disable id-length */

import {barChartCodeBlock, barChartElements} from '../lib/barChart.js';
import test from 'ava';


test('testBarChart.js tests placeholder', (t) => {
    t.true(barChartCodeBlock !== null);
    t.true(barChartElements !== null);
});
