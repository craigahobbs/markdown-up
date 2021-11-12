// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/util */


// JSDoc typedefs

/**
 * @typedef {Object} ChartOptions
 * @property {number} [fontSize] - The chart font size
 * @property {string} [url] - The markdown file URL
 * @property {module:lib/util~ChartVariables} [variables] - The map of variable name to chart variable
 * @property {Window} [window] - The web browser's Window object
 */

/**
 * @typedef {Object.<string, module:lib/util~ChartVariable>} ChartVariables
 */

/**
 * @typedef {Object} ChartVariable
 * @property {Date} [datetime] - The datetime variable value
 * @property {number} [number] - The number variable value
 * @property {string} [string] - The string variable value
 */


// The categorical color palette
export const categoricalColors = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
    '#aec7e8',
    '#ffbb78',
    '#98df8a',
    '#ff9896',
    '#c5b0d5',
    '#c49c94',
    '#f7b6d2',
    '#c7c7c7',
    '#dbdb8d',
    '#9edae5'
];


// Helper function to format the title
export function formatTitle(chart, options) {
    const variables = {
        ...('variables' in chart ? chart.variables : {}),
        ...('variables' in options ? options.variables : {})
    };
    return chart.title.replace(rVariable, (match, variable) => {
        if (variable in variables) {
            const fieldValue = variables[variable];
            const value = 'datetime' in fieldValue ? fieldValue.datetime : ('number' in fieldValue ? fieldValue.number : fieldValue.string);
            return formatValue(value, chart);
        }
        return match;
    });
}

const rVariable = /\{\{(\w+)\}\}/;


// Helper function to format labels
export function formatValue(value, chart) {
    if (value instanceof Date) {
        const isoFormat = value.toISOString();
        if ('datetime' in chart && chart.datetime === 'Day') {
            return isoFormat.slice(0, isoFormat.indexOf('T'));
        }
        return isoFormat.replace(rDateCleanup, '');
    } else if (typeof value === 'number') {
        return value.toFixed('precision' in chart ? chart.precision : defaultPrecision);
    }
    return `${value}`;
}

const defaultPrecision = 2;
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
