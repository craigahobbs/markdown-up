// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE


// Helper function to format labels
export function formatValue(value, precision = null, datetime = null, trim = null) {
    if (value instanceof Date) {
        if (datetime === 'year') {
            // Round to nearest year
            let valueRounded = value;
            if (value.getUTCMonth() > 5) {
                valueRounded = new Date(value);
                valueRounded.setUTCFullYear(value.getUTCFullYear() + 1);
            }

            const isoFormat = valueRounded.toISOString();
            return isoFormat.slice(0, isoFormat.indexOf('T') - 6);
        } else if (datetime === 'month') {
            // Round to the nearest month
            let valueRounded = value;
            if (value.getUTCDate() > 15) {
                valueRounded = new Date(value);
                valueRounded.setMonth(value.getUTCMonth() + 1);
            }

            const isoFormat = valueRounded.toISOString();
            return isoFormat.slice(0, isoFormat.indexOf('T') - 3);
        } else if (datetime === 'day') {
            const isoFormat = value.toISOString();
            return isoFormat.slice(0, isoFormat.indexOf('T'));
        }
        return value.toISOString().replace(rDateCleanup, '');
    } else if (typeof value === 'number') {
        const numberFormat = value.toFixed(precision ?? defaultPrecision);
        return (trim ?? defaultTrim) ? numberFormat.replace(rNumberCleanup, '') : numberFormat;
    }
    return `${value}`;
}

const defaultPrecision = 2;
const defaultTrim = true;
const rNumberCleanup = /\.0*$/;
const rDateCleanup = /(?:(?:(?:-01)?T00:00)?:00)?\.\d\d\dZ$/;


// Helper function to compute a value's parameter
export function valueParameter(value, minValue, maxValue) {
    if (minValue === maxValue) {
        return 0;
    }

    if (minValue instanceof Date) {
        const minDateValue = minValue.valueOf();
        return (value.valueOf() - minDateValue) / (maxValue.valueOf() - minDateValue);
    }

    return (value - minValue) / (maxValue - minValue);
}


// Helper function to compute a value from a parameter
export function parameterValue(param, minValue, maxValue) {
    if (minValue instanceof Date) {
        const minDateValue = minValue.valueOf();
        return new Date(minDateValue + param * (maxValue.valueOf() - minDateValue));
    }

    return minValue + param * (maxValue - minValue);
}
