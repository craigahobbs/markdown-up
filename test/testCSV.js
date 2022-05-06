// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/* eslint-disable id-length */

import {parseCSV} from '../lib/csv.js';
import test from 'ava';


test('parseCSV', (t) => {
    const data = parseCSV(`\
ColumnA,Column B,ColumnC,ColumnD
1,abc,"10","xyz"
2,def,"11","pdq"
`);
    t.deepEqual(data, [
        {'ColumnA': '1', 'Column B': 'abc', 'ColumnC': '10', 'ColumnD': 'xyz'},
        {'ColumnA': '2', 'Column B': 'def', 'ColumnC': '11', 'ColumnD': 'pdq'}
    ]);
});
