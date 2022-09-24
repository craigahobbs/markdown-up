// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/* eslint-disable id-length */

import {
    addCalculatedField, aggregateData, compareValues, filterData, formatValue, joinData,
    parameterValue, parseCSV, sortData, topData, validateAggregation, validateData, valueParameter
} from '../lib/data.js';
import {ValidationError} from 'schema-markdown/lib/schema.js';
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


test('parseCSV, array', (t) => {
    const data = parseCSV([
        'A,B\na1,b1',
        'a2,b2'
    ]);
    t.deepEqual(data, [
        {'A': 'a1', 'B': 'b1'},
        {'A': 'a2', 'B': 'b2'}
    ]);
});


test('parseCSV, short row', (t) => {
    const data = parseCSV(`\
A,B
a1,b1
a2
`);
    t.deepEqual(data, [
        {'A': 'a1', 'B': 'b1'},
        {'A': 'a2', 'B': 'null'}
    ]);
});


test('parseCSV, blank lines', (t) => {
    const data = parseCSV([
        'A,B',
        '  ',
        'a1,b1',
        '',
        'a2,b2'
    ]);
    t.deepEqual(data, [
        {'A': 'a1', 'B': 'b1'},
        {'A': 'a2', 'B': 'b2'}
    ]);
});


test('parseCSV, quotes', (t) => {
    const data = parseCSV(`\
A,B
"a,1",b1
a2,"b,2"
`);
    t.deepEqual(data, [
        {'A': 'a,1', 'B': 'b1'},
        {'A': 'a2', 'B': 'b,2'}
    ]);
});


test('parseCSV, quotes escaped', (t) => {
    const data = parseCSV(`\
A,B
"a,""1""",b1
a2,"b,""2"""
`);
    t.deepEqual(data, [
        {'A': 'a,"1"', 'B': 'b1'},
        {'A': 'a2', 'B': 'b,"2"'}
    ]);
});


test('parseCSV, spaces', (t) => {
    const data = parseCSV([
        'A,B',
        ' a1,b1 ',
        ' "a2","b2" '
    ]);
    t.deepEqual(data, [
        {'A': ' a1', 'B': 'b1 '},
        {'A': ' "a2"', 'B': 'b2'}
    ]);
});


test('parseCSV, empty file', (t) => {
    const data = parseCSV('');
    t.deepEqual(data, []);
});


test('validateData', (t) => {
    const data = [
        {'A': 1, 'B': '5', 'C': 10},
        {'A': 2, 'B': '6', 'C': null},
        {'A': 3, 'B': '7', 'C': null}
    ];
    t.deepEqual(validateData(data), {
        'A': 'number',
        'B': 'string',
        'C': 'number'
    });
    t.deepEqual(data, [
        {'A': 1, 'B': '5', 'C': 10},
        {'A': 2, 'B': '6', 'C': null},
        {'A': 3, 'B': '7', 'C': null}
    ]);
});


test('validateData, csv', (t) => {
    const data = [
        {'A': 1, 'B': '5', 'C': 10},
        {'A': 2, 'B': 6, 'C': null},
        {'A': 3, 'B': '7', 'C': 'null'}
    ];
    t.deepEqual(validateData(data, true), {
        'A': 'number',
        'B': 'number',
        'C': 'number'
    });
    t.deepEqual(data, [
        {'A': 1, 'B': 5, 'C': 10},
        {'A': 2, 'B': 6, 'C': null},
        {'A': 3, 'B': 7, 'C': null}
    ]);
});


test('validateData, datetime', (t) => {
    const data = [
        {'A': new Date(Date.UTC(2022, 7, 30))},
        {'A': '2022-08-30'},
        {'A': '2022-08-30T11:04:00Z'},
        {'A': '2022-08-30T11:04:00-07:00'},
        {'A': null}
    ];
    t.deepEqual(validateData(data, true), {
        'A': 'datetime'
    });

    // Fixup the date-format above as its affected by the current time zone
    const date = data[1].A;
    data[1].A = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    t.deepEqual(data, [
        {'A': new Date(Date.UTC(2022, 7, 30))},
        {'A': new Date(Date.UTC(2022, 7, 30))},
        {'A': new Date(Date.UTC(2022, 7, 30, 11, 4))},
        {'A': new Date(Date.UTC(2022, 7, 30, 18, 4))},
        {'A': null}
    ]);
});


test('validateData, datetime string', (t) => {
    const data = [
        {'A': '2022-08-30'},
        {'A': new Date(Date.UTC(2022, 7, 30))},
        {'A': '2022-08-30T11:04:00Z'},
        {'A': '2022-08-30T11:04:00-07:00'},
        {'A': null}
    ];
    t.deepEqual(validateData(data, true), {
        'A': 'datetime'
    });

    // Fixup the date-format above as its affected by the current time zone
    const date = data[0].A;
    data[0].A = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    t.deepEqual(data, [
        {'A': new Date(Date.UTC(2022, 7, 30))},
        {'A': new Date(Date.UTC(2022, 7, 30))},
        {'A': new Date(Date.UTC(2022, 7, 30, 11, 4))},
        {'A': new Date(Date.UTC(2022, 7, 30, 18, 4))},
        {'A': null}
    ]);
});


test('validateData, number error', (t) => {
    const data = [
        {'A': 1},
        {'A': '2'}
    ];
    const error = t.throws(() => {
        validateData(data);
    }, {'instanceOf': Error});
    t.is(error.message, 'Invalid "A" field value "2", expected type number');
});


test('validateData, number error csv', (t) => {
    const data = [
        {'A': 1},
        {'A': 'abc'}
    ];
    const error = t.throws(() => {
        validateData(data, true);
    }, {'instanceOf': Error});
    t.is(error.message, 'Invalid "A" field value "abc", expected type number');
});


test('validateData, datetime error', (t) => {
    const data = [
        {'A': new Date(Date.UTC(2022, 7, 30))},
        {'A': 2}
    ];
    const error = t.throws(() => {
        validateData(data);
    }, {'instanceOf': Error});
    t.is(error.message, 'Invalid "A" field value 2, expected type datetime');
});


test('validateData, datetime error csv', (t) => {
    const data = [
        {'A': new Date(Date.UTC(2022, 7, 30))},
        {'A': 'abc'}
    ];
    const error = t.throws(() => {
        validateData(data, true);
    }, {'instanceOf': Error});
    t.is(error.message, 'Invalid "A" field value "abc", expected type datetime');
});


test('validateData, string error', (t) => {
    const data = [
        {'A': 'a1'},
        {'A': 2}
    ];
    const error = t.throws(() => {
        validateData(data, true);
    }, {'instanceOf': Error});
    t.is(error.message, 'Invalid "A" field value 2, expected type string');
});


test('joinData', (t) => {
    const leftData = [
        {'a': 1, 'b': 5},
        {'a': 1, 'b': 6},
        {'a': 2, 'b': 7},
        {'a': 3, 'b': 8}
    ];
    const rightData = [
        {'a': 1, 'c': 10},
        {'a': 2, 'c': 11},
        {'a': 2, 'c': 12}
    ];
    t.deepEqual(joinData(leftData, rightData, 'a'), [
        {'a': 1, 'b': 5, 'a2': 1, 'c': 10},
        {'a': 1, 'b': 6, 'a2': 1, 'c': 10},
        {'a': 2, 'b': 7, 'a2': 2, 'c': 11},
        {'a': 2, 'b': 7, 'a2': 2, 'c': 12},
        {'a': 3, 'b': 8}
    ]);
});


test('joinData, options', (t) => {
    const leftData = [
        {'a': 1, 'b': 5},
        {'a': 1, 'b': 6},
        {'a': 2, 'b': 7},
        {'a': 3, 'b': 8}
    ];
    const rightData = [
        {'a': 2, 'c': 10},
        {'a': 4, 'c': 11},
        {'a': 4, 'c': 12}
    ];
    t.deepEqual(
        joinData(leftData, rightData, 'a', 'a / denominator', true, {'denominator': 2}),
        [
            {'a': 1, 'b': 5, 'a2': 2, 'c': 10},
            {'a': 1, 'b': 6, 'a2': 2, 'c': 10},
            {'a': 2, 'b': 7, 'a2': 4, 'c': 11},
            {'a': 2, 'b': 7, 'a2': 4, 'c': 12}
        ]
    );
});


test('addCalculatedField', (t) => {
    const data = [
        {'A': 1, 'B': 5},
        {'A': 2, 'B': 6}
    ];
    t.deepEqual(addCalculatedField(data, 'C', 'A * B'), [
        {'A': 1, 'B': 5, 'C': 5},
        {'A': 2, 'B': 6, 'C': 12}
    ]);
});


test('addCalculatedField, variables', (t) => {
    const data = [
        {'A': 1},
        {'A': 2}
    ];
    t.deepEqual(addCalculatedField(data, 'C', 'A * B', {'B': 5}), [
        {'A': 1, 'C': 5},
        {'A': 2, 'C': 10}
    ]);
});


test('filterData', (t) => {
    const data = [
        {'A': 1, 'B': 5},
        {'A': 6, 'B': 2},
        {'A': 3, 'B': 7}
    ];
    t.deepEqual(filterData(data, 'A > B'), [
        {'A': 6, 'B': 2}
    ]);
});


test('filterData, variables', (t) => {
    const data = [
        {'A': 1, 'B': 5},
        {'A': 6, 'B': 2},
        {'A': 3, 'B': 7}
    ];
    t.deepEqual(filterData(data, 'A > test', {'test': 5}), [
        {'A': 6, 'B': 2}
    ]);
});


test('validateAggregation', (t) => {
    const aggregation = {
        'categories': ['A', 'B'],
        'measures': [
            {'field': 'C', 'function': 'average'},
            {'field': 'C', 'function': 'average', 'name': 'Average(C)'}
        ]
    };
    t.deepEqual(validateAggregation(aggregation), aggregation);
});


test('validateAggregation, error', (t) => {
    const aggregation = {};
    const error = t.throws(() => {
        validateAggregation(aggregation);
    }, {'instanceOf': ValidationError});
    t.is(error.message, "Required member 'measures' missing");
});


test('aggregateData', (t) => {
    const data = [
        {'A': 1, 'B': 1, 'C': 4},
        {'A': 1, 'B': 1, 'C': 5},
        {'A': 1, 'B': 1}
    ];
    const aggregation = {
        'measures': [
            {'field': 'C', 'function': 'average'}
        ]
    };
    validateAggregation(aggregation);
    t.deepEqual(aggregateData(data, aggregation), [
        {'C': 3}
    ]);
});


test('aggregateData, categories', (t) => {
    const data = [
        {'A': 1, 'B': 1, 'C': 4},
        {'A': 1, 'B': 1, 'C': 5},
        {'A': 1, 'B': 1},
        {'A': 1, 'B': 2, 'C': 7},
        {'A': 1, 'B': 2, 'C': 8},
        {'A': 2, 'B': 1, 'C': 9},
        {'A': 2, 'B': 1, 'C': 10},
        {'A': 2, 'B': 2}
    ];
    const aggregation = {
        'categories': ['A', 'B'],
        'measures': [
            {'field': 'C', 'function': 'average'},
            {'field': 'C', 'function': 'average', 'name': 'Average(C)'}
        ]
    };
    validateAggregation(aggregation);
    t.deepEqual(aggregateData(data, aggregation), [
        {'A': 1, 'B': 1, 'C': 3, 'Average(C)': 3},
        {'A': 1, 'B': 2, 'C': 7.5, 'Average(C)': 7.5},
        {'A': 2, 'B': 1, 'C': 9.5, 'Average(C)': 9.5},
        {'A': 2, 'B': 2, 'C': 0, 'Average(C)': 0}
    ]);
});


test('aggregateData, count', (t) => {
    const data = [
        {'A': 1, 'B': 1, 'C': 5},
        {'A': 1, 'B': 1, 'C': 6},
        {'A': 1, 'B': 1},
        {'A': 1, 'B': 2, 'C': 7},
        {'A': 1, 'B': 2, 'C': 8},
        {'A': 2, 'B': 1, 'C': 9},
        {'A': 2, 'B': 1, 'C': 10},
        {'A': 2, 'B': 2}
    ];
    const aggregation = {
        'categories': ['A', 'B'],
        'measures': [
            {'field': 'C', 'function': 'count'}
        ]
    };
    validateAggregation(aggregation);
    t.deepEqual(aggregateData(data, aggregation), [
        {'A': 1, 'B': 1, 'C': 3},
        {'A': 1, 'B': 2, 'C': 2},
        {'A': 2, 'B': 1, 'C': 2},
        {'A': 2, 'B': 2, 'C': 1}
    ]);
});


test('aggregateData, max', (t) => {
    const data = [
        {'A': 1, 'B': 1, 'C': 5},
        {'A': 1, 'B': 1, 'C': 6},
        {'A': 1, 'B': 1},
        {'A': 1, 'B': 2, 'C': 7},
        {'A': 1, 'B': 2, 'C': 8},
        {'A': 2, 'B': 1, 'C': 9},
        {'A': 2, 'B': 1, 'C': 10},
        {'A': 2, 'B': 2}
    ];
    const aggregation = {
        'categories': ['A', 'B'],
        'measures': [
            {'field': 'C', 'function': 'max'}
        ]
    };
    validateAggregation(aggregation);
    t.deepEqual(aggregateData(data, aggregation), [
        {'A': 1, 'B': 1, 'C': 6},
        {'A': 1, 'B': 2, 'C': 8},
        {'A': 2, 'B': 1, 'C': 10},
        {'A': 2, 'B': 2, 'C': null}
    ]);
});


test('aggregateData, min', (t) => {
    const data = [
        {'A': 1, 'B': 1, 'C': 5},
        {'A': 1, 'B': 1, 'C': 6},
        {'A': 1, 'B': 1},
        {'A': 1, 'B': 2, 'C': 7},
        {'A': 1, 'B': 2, 'C': 8},
        {'A': 2, 'B': 1, 'C': 9},
        {'A': 2, 'B': 1, 'C': 10},
        {'A': 2, 'B': 2}
    ];
    const aggregation = {
        'categories': ['A', 'B'],
        'measures': [
            {'field': 'C', 'function': 'min'}
        ]
    };
    validateAggregation(aggregation);
    t.deepEqual(aggregateData(data, aggregation), [
        {'A': 1, 'B': 1, 'C': null},
        {'A': 1, 'B': 2, 'C': 7},
        {'A': 2, 'B': 1, 'C': 9},
        {'A': 2, 'B': 2, 'C': null}
    ]);
});


test('aggregateData, sum', (t) => {
    const data = [
        {'A': 1, 'B': 1, 'C': 5},
        {'A': 1, 'B': 1, 'C': 6},
        {'A': 1, 'B': 1},
        {'A': 1, 'B': 2, 'C': 7},
        {'A': 1, 'B': 2, 'C': 8},
        {'A': 2, 'B': 1, 'C': 9},
        {'A': 2, 'B': 1, 'C': 10},
        {'A': 2, 'B': 2}
    ];
    const aggregation = {
        'categories': ['A', 'B'],
        'measures': [
            {'field': 'C', 'function': 'sum'}
        ]
    };
    validateAggregation(aggregation);
    t.deepEqual(aggregateData(data, aggregation), [
        {'A': 1, 'B': 1, 'C': 11},
        {'A': 1, 'B': 2, 'C': 15},
        {'A': 2, 'B': 1, 'C': 19},
        {'A': 2, 'B': 2, 'C': 0}
    ]);
});


test('sortData', (t) => {
    const data = [
        {'A': 1, 'B': 1, 'C': 5},
        {'A': 1, 'B': 1, 'C': 6},
        {'A': 1},
        {'B': 2, 'C': 7},
        {'A': 1, 'B': 2, 'C': 8},
        {'A': 2, 'B': 1, 'C': 9},
        {'A': 2, 'B': 1, 'C': 10},
        {'A': 2, 'B': 2}
    ];
    t.deepEqual(sortData(data, [['A', true], ['B']]), [
        {'A': 2, 'B': 1, 'C': 9},
        {'A': 2, 'B': 1, 'C': 10},
        {'A': 2, 'B': 2},
        {'A': 1},
        {'A': 1, 'B': 1, 'C': 5},
        {'A': 1, 'B': 1, 'C': 6},
        {'A': 1, 'B': 2, 'C': 8},
        {'B': 2, 'C': 7}
    ]);
});


test('topData', (t) => {
    const data = [
        {'A': 'abc', 'B': 1, 'C': 1},
        {'A': 'abc', 'B': 1, 'C': 2},
        {'A': 'abc', 'B': 1, 'C': 3},
        {'A': 'abc', 'B': 2, 'C': 1},
        {'A': 'abc', 'B': 2, 'C': 2},
        {'A': 'def', 'B': 1, 'C': 1},
        {'A': 'ghi', 'C': 1}
    ];
    t.deepEqual(topData(data, 2, ['A', 'B']), [
        {'A': 'abc', 'B': 1, 'C': 1},
        {'A': 'abc', 'B': 1, 'C': 2},
        {'A': 'abc', 'B': 2, 'C': 1},
        {'A': 'abc', 'B': 2, 'C': 2},
        {'A': 'def', 'B': 1, 'C': 1},
        {'A': 'ghi', 'C': 1}
    ]);
    t.deepEqual(topData(data, 1, ['A']), [
        {'A': 'abc', 'B': 1, 'C': 1},
        {'A': 'def', 'B': 1, 'C': 1},
        {'A': 'ghi', 'C': 1}
    ]);
    t.deepEqual(topData(data, 3), [
        {'A': 'abc', 'B': 1, 'C': 1},
        {'A': 'abc', 'B': 1, 'C': 2},
        {'A': 'abc', 'B': 1, 'C': 3}
    ]);
});


test('formatValue, date', (t) => {
    t.is(formatValue(new Date(Date.UTC(2022, 7, 30))), '2022-08-30');
    t.is(formatValue(new Date(Date.UTC(2022, 7, 30, 12))), '2022-08-30T12:00');
    t.is(formatValue(new Date(Date.UTC(2022, 7, 30, 12, 15))), '2022-08-30T12:15');
    t.is(formatValue(new Date(Date.UTC(2022, 7, 30, 12, 15, 30))), '2022-08-30T12:15:30');
});


test('formatValue, date year', (t) => {
    t.is(formatValue(new Date(Date.UTC(2022, 5, 30, 12)), null, 'year'), '2022');
    t.is(formatValue(new Date(Date.UTC(2022, 7, 30, 12)), null, 'year'), '2023');
    t.is(formatValue(new Date(Date.UTC(2022, 0, 1, 12)), null, 'year'), '2022');
});


test('formatValue, date month', (t) => {
    t.is(formatValue(new Date(Date.UTC(2022, 7, 1)), null, 'month'), '2022-08');
    t.is(formatValue(new Date(Date.UTC(2022, 7, 30)), null, 'month'), '2022-09');
    t.is(formatValue(new Date(Date.UTC(2022, 0, 1)), null, 'month'), '2022-01');
});


test('formatValue, date day', (t) => {
    t.is(formatValue(new Date(Date.UTC(2022, 7, 30, 12)), null, 'day'), '2022-08-30');
});


test('formatValue, number', (t) => {
    t.is(formatValue(12.5), '12.50');
});


test('formatValue, number precision', (t) => {
    t.is(formatValue(12.5, 1), '12.5');
});


test('formatValue, other', (t) => {
    t.is(formatValue(null), 'null');
    t.is(formatValue('abc'), 'abc');
});


test('compareValues', (t) => {
    t.is(compareValues(1, 1), 0);
    t.is(compareValues(1, 2), -1);
    t.is(compareValues(2, 1), 1);
    t.is(compareValues(null, null), 0);
    t.is(compareValues(null, 1), -1);
    t.is(compareValues(1, null), 1);
});


test('compareValues, date', (t) => {
    const value1 = new Date(Date.UTC(2022, 6, 30));
    const value2 = new Date(Date.UTC(2022, 7, 30));
    t.is(compareValues(value1, value1), 0);
    t.is(compareValues(value1, value2), -1);
    t.is(compareValues(value2, value1), 1);
    t.is(compareValues(null, null), 0);
    t.is(compareValues(null, value1), -1);
    t.is(compareValues(value1, null), 1);
});


test('valueParameter', (t) => {
    t.is(valueParameter(-5, 0, 10), -0.5);
    t.is(valueParameter(0, 0, 10), 0);
    t.is(valueParameter(5, 0, 10), 0.5);
    t.is(valueParameter(10, 0, 10), 1);
    t.is(valueParameter(15, 0, 10), 1.5);

    // Min/max same
    t.is(valueParameter(5, 5, 5), 0);

    // Date
    const minDate = new Date(Date.UTC(2022, 8, 1));
    const maxDate = new Date(Date.UTC(2022, 9, 1));
    t.is(valueParameter(new Date(Date.UTC(2022, 7, 14)), minDate, maxDate), -0.6);
    t.is(valueParameter(minDate, minDate, maxDate), 0);
    t.is(valueParameter(new Date(Date.UTC(2022, 8, 13)), minDate, maxDate), 0.4);
    t.is(valueParameter(maxDate, minDate, maxDate), 1);
    t.is(valueParameter(new Date(Date.UTC(2022, 9, 13)), minDate, maxDate), 1.4);
});


test('parameterValue', (t) => {
    t.is(parameterValue(-0.5, 0, 10), -5);
    t.is(parameterValue(0, 0, 10), 0);
    t.is(parameterValue(0.5, 0, 10), 5);
    t.is(parameterValue(1, 0, 10), 10);
    t.is(parameterValue(1.5, 0, 10), 15);

    // Date
    const minDate = new Date(Date.UTC(2022, 8, 1));
    const maxDate = new Date(Date.UTC(2022, 9, 1));
    t.deepEqual(parameterValue(-0.6, minDate, maxDate), new Date(Date.UTC(2022, 7, 14)));
    t.deepEqual(parameterValue(0, minDate, maxDate), minDate);
    t.deepEqual(parameterValue(0.4, minDate, maxDate), new Date(Date.UTC(2022, 8, 13)));
    t.deepEqual(parameterValue(1, minDate, maxDate), maxDate);
    t.deepEqual(parameterValue(1.4, minDate, maxDate), new Date(Date.UTC(2022, 9, 13)));
});
