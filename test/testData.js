// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/* eslint-disable id-length */

import {addCalculatedField, aggregateData, filterData, getCalculatedValueType, loadChartData,
    loadData, sortData, topData, validateData} from '../lib/data.js';
import test from 'ava';


test('testData.js tests placeholder', (t) => {
    t.true(addCalculatedField !== null);
    t.true(aggregateData !== null);
    t.true(getCalculatedValueType !== null);
    t.true(filterData !== null);
    t.true(loadChartData !== null);
    t.true(loadData !== null);
    t.true(sortData !== null);
    t.true(topData !== null);
    t.true(validateData !== null);
});
