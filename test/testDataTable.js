// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/* eslint-disable id-length */

import {dataTableCodeBlock, dataTableElements} from '../lib/dataTable.js';
import test from 'ava';


test('testDataTable.js tests placeholder', (t) => {
    t.true(dataTableCodeBlock !== null);
    t.true(dataTableElements !== null);
});
