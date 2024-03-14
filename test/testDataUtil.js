// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {formatValue, parameterValue, valueParameter} from '../lib/dataUtil.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


test('formatValue, date', () => {
    assert.equal(formatValue(new Date(2022, 7, 30)), '2022-08-30');
    assert.equal(formatValue(new Date(2022, 7, 30, 12)), '2022-08-30T12:00');
    assert.equal(formatValue(new Date(2022, 7, 30, 12, 15)), '2022-08-30T12:15');
    assert.equal(formatValue(new Date(2022, 7, 30, 12, 15, 30)), '2022-08-30T12:15:30');
});


test('formatValue, date year', () => {
    assert.equal(formatValue(new Date(2022, 5, 30, 12), null, 'year'), '2022');
    assert.equal(formatValue(new Date(2022, 7, 30, 12), null, 'year'), '2023');
    assert.equal(formatValue(new Date(2022, 0, 1, 12), null, 'year'), '2022');
});


test('formatValue, date month', () => {
    assert.equal(formatValue(new Date(2022, 7, 1), null, 'month'), '2022-08');
    assert.equal(formatValue(new Date(2022, 7, 30), null, 'month'), '2022-09');
    assert.equal(formatValue(new Date(2022, 0, 1), null, 'month'), '2022-01');
});


test('formatValue, date day', () => {
    assert.equal(formatValue(new Date(2022, 7, 30, 12), null, 'day'), '2022-08-30');
});


test('formatValue, number', () => {
    assert.equal(formatValue(12.5), '12.50');
});


test('formatValue, number precision', () => {
    assert.equal(formatValue(12.5, 1), '12.5');
});


test('formatValue, other', () => {
    assert.equal(formatValue(null), 'null');
    assert.equal(formatValue('abc'), 'abc');
});


test('valueParameter', () => {
    assert.equal(valueParameter(-5, 0, 10), -0.5);
    assert.equal(valueParameter(0, 0, 10), 0);
    assert.equal(valueParameter(5, 0, 10), 0.5);
    assert.equal(valueParameter(10, 0, 10), 1);
    assert.equal(valueParameter(15, 0, 10), 1.5);

    // Min/max same
    assert.equal(valueParameter(5, 5, 5), 0);

    // Date
    const minDate = new Date(2022, 8, 1);
    const maxDate = new Date(2022, 9, 1);
    assert.equal(valueParameter(new Date(2022, 7, 14), minDate, maxDate), -0.6);
    assert.equal(valueParameter(minDate, minDate, maxDate), 0);
    assert.equal(valueParameter(new Date(2022, 8, 13), minDate, maxDate), 0.4);
    assert.equal(valueParameter(maxDate, minDate, maxDate), 1);
    assert.equal(valueParameter(new Date(2022, 9, 13), minDate, maxDate), 1.4);
});


test('parameterValue', () => {
    assert.equal(parameterValue(-0.5, 0, 10), -5);
    assert.equal(parameterValue(0, 0, 10), 0);
    assert.equal(parameterValue(0.5, 0, 10), 5);
    assert.equal(parameterValue(1, 0, 10), 10);
    assert.equal(parameterValue(1.5, 0, 10), 15);

    // Date
    const minDate = new Date(2022, 8, 1);
    const maxDate = new Date(2022, 9, 1);
    assert.deepEqual(parameterValue(-0.6, minDate, maxDate), new Date(2022, 7, 14));
    assert.deepEqual(parameterValue(0, minDate, maxDate), minDate);
    assert.deepEqual(parameterValue(0.4, minDate, maxDate), new Date(2022, 8, 13));
    assert.deepEqual(parameterValue(1, minDate, maxDate), maxDate);
    assert.deepEqual(parameterValue(1.4, minDate, maxDate), new Date(2022, 9, 13));
});
