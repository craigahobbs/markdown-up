// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {valueString, valueType} from '../bare-script/lib/value.js';


// Helper function to format labels
export function formatValue(value, precision = null, datetime = null, trim = null) {
    const type = valueType(value);
    if (type === 'datetime') {
        if (datetime === 'year') {
            // Round to nearest year
            let valueRounded = value;
            if (value.getMonth() > 5) {
                valueRounded = new Date(value);
                valueRounded.setFullYear(value.getFullYear() + 1);
            }

            const isoFormat = valueString(valueRounded);
            return isoFormat.slice(0, isoFormat.indexOf('T') - 6);
        } else if (datetime === 'month') {
            // Round to the nearest month
            let valueRounded = value;
            if (value.getDate() > 15) {
                valueRounded = new Date(value);
                valueRounded.setMonth(value.getMonth() + 1);
            }

            const isoFormat = valueString(valueRounded);
            return isoFormat.slice(0, isoFormat.indexOf('T') - 3);
        } else if (datetime === 'day') {
            const isoFormat = valueString(value);
            return isoFormat.slice(0, isoFormat.indexOf('T'));
        }
        return valueString(value).replace(rDateCleanup, '');
    } else if (type === 'number') {
        const numberFormat = value.toFixed(precision ?? defaultPrecision);
        return (trim ?? defaultTrim) ? numberFormat.replace(rNumberCleanup, '') : numberFormat;
    }
    return `${value}`;
}

const defaultPrecision = 2;
const defaultTrim = true;
const rNumberCleanup = /\.0*$/;
const rDateCleanup = /(?:(?:(?:-01)?T00:00)?:00)?(?:\.\d{1,6})?(?:Z|[+-]\d\d:\d\d)$/;


// Helper function to compute a value's parameter
export function valueParameter(value, minValue, maxValue) {
    if (minValue === maxValue) {
        return 0;
    }

    if (valueType(minValue) === 'datetime') {
        const minDateValue = minValue.valueOf();
        return (value.valueOf() - minDateValue) / (maxValue.valueOf() - minDateValue);
    }

    return (value - minValue) / (maxValue - minValue);
}


// Helper function to compute a value from a parameter
export function parameterValue(param, minValue, maxValue) {
    if (valueType(minValue) === 'datetime') {
        const minDateValue = minValue.valueOf();
        return new Date(minDateValue + param * (maxValue.valueOf() - minDateValue));
    }

    return minValue + param * (maxValue - minValue);
}
