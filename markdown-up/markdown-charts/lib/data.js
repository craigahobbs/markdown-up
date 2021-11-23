// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/data */

import {compareValues, getFieldValue} from './util.js';
import {getBaseURL, isRelativeURL} from '../../../markdown-model/index.js';


/**
 * @typedef {Object} LoadChartDataResult
 * @property {Object[]} data - The data row object array
 * @property {Object} types - The map of field name to field type ("datetime", "number", "string")
 */


/**
 * Load the chart's data
 *
 * @param {Object} chart - The chart model
 * @param {module:lib/util~ChartOptions} [options={}] - Chart options object
 * @returns {module:lib/data~LoadChartDataResult}
 */
export async function loadChartData(chart, options = {}) {
    // Load the data resources
    const fixDataURL = (url) => {
        if ('url' in options && options.url !== null && isRelativeURL(url)) {
            return `${getBaseURL(options.url)}${url}`;
        }
        return url;
    };
    const dataURLs = [
        fixDataURL(chart.data.url),
        ...('joins' in chart.data ? chart.data.joins.map((join) => fixDataURL(join.url)) : [])
    ];
    const dataResponses = await Promise.all(dataURLs.map((joinURL) => options.window.fetch(joinURL)));
    const dataTypes = await Promise.all(dataResponses.map((response, ixResponse) => dataResponseHandler(dataURLs[ixResponse], response)));
    let [{data, types}] = dataTypes;

    // Join the data
    if (dataResponses.length > 1) {
        // Helper function to compute a unique field name
        const mapFieldName = (field) => {
            let unique = field;
            let ixUnique = 2;
            while (unique in types) {
                unique = `${field}${ixUnique}`;
                ixUnique += 1;
            }
            return [field, unique];
        };

        // Perform each join in sequence
        let leftData;
        for (let ixJoin = 0; ixJoin < chart.data.joins.length; ixJoin++) {
            const join = chart.data.joins[ixJoin];
            const {leftFields} = join;
            const rightFields = 'rightFields' in join ? join.rightFields : leftFields;
            const rightData = dataTypes[ixJoin + 1].data;
            const rightTypes = dataTypes[ixJoin + 1].types;

            // Validate left and right field names
            if (leftFields.length !== rightFields.length) {
                throw new Error(
                    `Join "${join.url}" has left-field count ${leftFields.length} and right-field count ${rightFields.length}`
                );
            }
            for (let ixJoinField = 0; ixJoinField < leftFields.length; ixJoinField++) {
                const leftField = leftFields[ixJoinField];
                const rightField = rightFields[ixJoinField];
                if (!(leftField in types)) {
                    throw new Error(`Unknown "${join.url}" join left-field "${leftField}`);
                }
                if (!(rightField in rightTypes)) {
                    throw new Error(`Unknown "${join.url}" join right-field "${rightField}`);
                }
                if (types[leftField] !== rightTypes[rightField]) {
                    throw new Error(
                        `Join "${join.url}" has left-field type "${types[leftField]}" and right-field type "${rightTypes[rightField]}`
                    );
                }
            }

            // Bucket rows by category
            const rightCategoryRows = {};
            for (const row of rightData) {
                const categoryKey = JSON.stringify(rightFields.map((field) => (field in row ? row[field] : null)));
                if (!(categoryKey in rightCategoryRows)) {
                    rightCategoryRows[categoryKey] = [];
                }
                rightCategoryRows[categoryKey].push(row);
            }

            // Compute the right column names
            const rightFieldMap = Object.fromEntries(Object.keys(rightTypes).map(mapFieldName));

            // Update types
            for (const rightField of Object.keys(rightTypes)) {
                types[rightFieldMap[rightField]] = rightTypes[rightField];
            }

            // Join the left with the right
            leftData = data;
            data = [];
            for (const row of leftData) {
                const categoryKey = JSON.stringify(leftFields.map((field) => (field in row ? row[field] : null)));
                if (categoryKey in rightCategoryRows) {
                    for (const rightRow of rightCategoryRows[categoryKey]) {
                        const joinRow = {...row};
                        for (const rightField of Object.keys(rightTypes)) {
                            if (rightField in rightRow) {
                                joinRow[rightFieldMap[rightField]] = rightRow[rightField];
                            }
                        }
                        data.push(joinRow);
                    }
                } else {
                    data.push(row);
                }
            }
        }
    }

    // Filter the data
    if ('filters' in chart) {
        data = filterData(chart, data, types, options);
    }

    // Aggregate the data
    if ('aggregation' in chart) {
        ({data, types} = aggregateData(chart, data, types));
    }

    // Sort the data
    if ('sorts' in chart) {
        sortData(chart, data);
    }

    // Top the data
    if ('top' in chart) {
        data = topData(chart, data);
    }

    return {data, types};
}


// Helper function to handle data fetch responses
async function dataResponseHandler(url, response) {
    // Fetch error?
    if (!response.ok) {
        const status = response.statusText;
        throw new Error(`Could not fetch "${url}"${status === '' ? '' : `, ${JSON.stringify(status)}`}`);
    }

    // CSV?
    let data;
    const csv = url.endsWith('.csv');
    if (csv) {
        data = parseCSV(await response.text());
    } else {
        data = await response.json();
    }

    // Validate the data
    const types = validateData(data, {csv});

    return {data, types};
}


/**
 * Parse CSV text to a JSON data array
 *
 * @param {string} text - The CSV text
 * @returns {Object[]}
 */
export function parseCSV(text) {
    const data = [];
    const splitLines = text.split(rCSVLineSplit).map((line) => line.replace(rCSVLineScrub, '$1').split(rCSVFieldSplit));
    const [fields] = splitLines;
    for (let ixLine = 1; ixLine < splitLines.length; ixLine += 1) {
        const splitLine = splitLines[ixLine];
        if (splitLine.length > 1 || splitLine[0] !== '') {
            data.push(Object.fromEntries(fields.map(
                (field, ixField) => [field, ixField < splitLine.length ? splitLine[ixField] : 'null']
            )));
        }
    }
    return data;
}

const rCSVLineSplit = /\r?\n/;
const rCSVLineScrub = /^"?(.*?)"?$/;
const rCSVFieldSplit = /"?,"?/;


/**
 * Determine data field types and parse/validate field values
 *
 * @param {Object[]} data - The data array. Row objects are updated with parsed/validated values.
 * @param {boolean} [csv=false] - If true, parse number and null strings
 * @returns {Object} The map of field name to field type ("datetime", "number", "string")
 */
export function validateData(data, csv = false) {
    // Determine field types
    const types = {};
    for (const row of data) {
        for (const [field, value] of Object.entries(row)) {
            if (!(field in types)) {
                if (typeof value === 'number') {
                    types[field] = 'number';
                } else if (value instanceof Date) {
                    types[field] = 'datetime';
                } else if (typeof value === 'string' && (!csv || value !== 'null')) {
                    if (parseCSVDatetime(value) !== null) {
                        types[field] = 'datetime';
                    } else if (csv && parseCSVNumber(value) !== null) {
                        types[field] = 'number';
                    } else {
                        types[field] = 'string';
                    }
                }
            }
        }
    }

    // Validate field values
    const throwFieldError = (field, fieldType, fieldValue) => {
        throw new Error(`Invalid "${field}" field value ${JSON.stringify(fieldValue)}, expected type ${fieldType}`);
    };
    for (const row of data) {
        for (const [field, value] of Object.entries(row)) {
            const fieldType = field in types ? types[field] : 'string';

            // Null string?
            if (csv && value === 'null') {
                row[field] = null;

            // Number field
            } else if (fieldType === 'number') {
                if (csv && typeof value === 'string') {
                    const numberValue = parseCSVNumber(value);
                    if (numberValue === null) {
                        throwFieldError(field, fieldType, value);
                    }
                    row[field] = numberValue;
                } else if (value !== null && typeof value !== 'number') {
                    throwFieldError(field, fieldType, value);
                }

            // Datetime field
            } else if (fieldType === 'datetime') {
                if (typeof value === 'string') {
                    const datetimeValue = parseCSVDatetime(value);
                    if (datetimeValue === null) {
                        throwFieldError(field, fieldType, value);
                    }
                    row[field] = datetimeValue;
                } else if (value !== null && !(value instanceof 'Date')) {
                    throwFieldError(field, fieldType, value);
                }

            // String field
            } else {
                if (value !== null && typeof value !== 'string') {
                    throwFieldError(field, fieldType, value);
                }
            }
        }
    }

    return types;
}


// Helper function to parse a CSV number
function parseCSVNumber(text) {
    const value = Number.parseFloat(text);
    if (Number.isNaN(value) || !Number.isFinite(value)) {
        return null;
    }
    return value;
}


// Helper function to parse a CSV datetime
function parseCSVDatetime(text) {
    if (rCSVDate.test(text)) {
        const localDate = new Date(text);
        return new Date(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate());
    } else if (rCSVDatetime.test(text)) {
        return new Date(text);
    }
    return null;
}

const rCSVDate = /^\d{4}-\d{2}-\d{2}$/;
const rCSVDatetime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;


/**
 * Filter data rows
 *
 * @param {Object} chart - The chart model
 * @param {Object[]} data - The data array. Row objects are updated with parsed/validated values.
 * @param {Object} types - The map of field name to field type ("datetime", "number", "string")
 * @param {module:lib/util~ChartOptions} [options={}] - Chart options object
 * @returns {Object[]} The filtered data array
 */
export function filterData(chart, data, types, options = {}) {
    const {filters} = chart;

    // Compute the variables
    const variables = {
        ...('variables' in chart ? chart.variables : {}),
        ...('variables' in options ? options.variables : {})
    };

    // Filter the rows
    const filterDescs = filters.map((filter) => `"${filter.field}" field filter value`);
    return data.filter((row) => filters.every((filter, ixFilter) => {
        // Get the filter field value - skip nulls
        if (!(filter.field in types)) {
            throw new Error(`Unknown filter field "${filter.field}"`);
        }
        const fieldName = filter.field;
        const fieldType = types[fieldName];
        const fieldValue = fieldName in row ? row[fieldName] : null;
        if (fieldValue === null) {
            return true;
        }

        // Test the field value
        const filterDesc = filterDescs[ixFilter];
        return (!('lt' in filter) || compareValues(fieldValue, getFieldValue(variables, filter.lt, fieldType, filterDesc)) < 0) &&
            (!('lte' in filter) || compareValues(fieldValue, getFieldValue(variables, filter.lte, fieldType, filterDesc)) <= 0) &&
            (!('gt' in filter) || compareValues(fieldValue, getFieldValue(variables, filter.gt, fieldType, filterDesc)) > 0) &&
            (!('gte' in filter) || compareValues(fieldValue, getFieldValue(variables, filter.gte, fieldType, filterDesc)) >= 0) &&
            (!('includes' in filter) || filter.includes.some(
                (filterValue) => compareValues(fieldValue, getFieldValue(variables, filterValue, fieldType, filterDesc)) === 0
            )) &&
            (!('excludes' in filter) || !filter.excludes.some(
                (filterValue) => compareValues(fieldValue, getFieldValue(variables, filterValue, fieldType, filterDesc)) === 0
            ));
    }));
}


/**
 * Aggregate data rows
 *
 * @param {Object} chart - The chart model
 * @param {Object[]} data - The data array
 * @param {Object} types - The map of field name to field type ("datetime", "number", "string")
 * @returns {module:lib/data~LoadChartDataResult}
 */
export function aggregateData(chart, data, types) {
    const {aggregation} = chart;

    // Compute the aggregate field types
    const aggregateTypes = {};
    for (const category of aggregation.categories) {
        if (!(category.field in types)) {
            throw new Error(`Unknown aggregation category field "${category.field}"`);
        }
        if ('by' in category && types[category.field] !== 'datetime') {
            throw new Error(`Invalid aggregation categorization "${category.by}" ` +
                            `for field "${category.field}" (type "${types[category.field]}")`);
        }
        aggregateTypes[getCategoryFieldName(category)] = types[category.field];
    }
    for (const measure of aggregation.measures) {
        if (!(measure.field in types)) {
            throw new Error(`Unknown aggregation category field "${measure.field}"`);
        }
        if ((measure.function === 'Average' || measure.function === 'Sum') && types[measure.field] !== 'number') {
            throw new Error(`Invalid aggregation measure function "${measure.function}" ` +
                            `for field "${measure.field}" (type "${types[measure.field]}")`);
        }
        aggregateTypes[getMeasureFieldName(measure)] = types[measure.field];
    }

    // Create the aggregate rows
    const measureRows = {};
    for (const row of data) {
        // Compute the category values
        const categoryValues = aggregation.categories.map((category) => {
            const value = row[category.field];
            if (category.by === 'Year') {
                return new Date(value.getFullYear(), 0, 1);
            } else if (category.by === 'Month') {
                return new Date(value.getFullYear(), value.getMonth(), 1);
            } else if (category.by === 'Day') {
                return new Date(value.getFullYear(), value.getMonth(), value.getDate());
            } else if (category.by === 'Hour') {
                return new Date(value.getFullYear(), value.getMonth(), value.getDate(), value.getHours());
            }
            return value;
        });

        // Get or create the aggregate row
        let aggregateRow;
        const rowKey = JSON.stringify(categoryValues);
        if (rowKey in measureRows) {
            aggregateRow = measureRows[rowKey];
        } else {
            aggregateRow = {};
            measureRows[rowKey] = aggregateRow;
            for (let ixCategory = 0; ixCategory < aggregation.categories.length; ixCategory++) {
                aggregateRow[getCategoryFieldName(aggregation.categories[ixCategory])] = categoryValues[ixCategory];
            }
        }

        // Add to the aggregate measure values
        for (const measure of aggregation.measures) {
            const measureFieldName = getMeasureFieldName(measure);
            const value = measure.field in row ? row[measure.field] : null;
            if (value !== null) {
                if (!(measureFieldName in aggregateRow)) {
                    aggregateRow[measureFieldName] = [];
                }
                aggregateRow[measureFieldName].push(value);
            }
        }
    }

    // Compute the measure values aggregate function value
    const aggregateRows = Object.values(measureRows);
    for (const aggregateRow of aggregateRows) {
        for (const measure of aggregation.measures) {
            const measureFieldName = getMeasureFieldName(measure);
            const measureValues = measureFieldName in aggregateRow ? aggregateRow[measureFieldName] : null;
            const measureFunction = measure.function;
            if (measureValues === null) {
                aggregateRow[measureFieldName] = null;
            } else if (measureFunction === 'Average') {
                aggregateRow[measureFieldName] = measureValues.reduce((sum, val) => sum + val) / measureValues.length;
            } else if (measureFunction === 'Count') {
                aggregateRow[measureFieldName] = measureValues.length;
            } else if (measureFunction === 'Max') {
                aggregateRow[measureFieldName] = measureValues.reduce((max, val) => (val > max ? val : max));
            } else if (measureFunction === 'Min') {
                aggregateRow[measureFieldName] = measureValues.reduce((min, val) => (val < min ? val : min));
            } else if (measureFunction === 'Sum') {
                aggregateRow[measureFieldName] = measureValues.reduce((sum, val) => sum + val);
            }
        }
    }

    return {'data': aggregateRows, 'types': aggregateTypes};
}


// Helper function to compute aggregation category field names
function getCategoryFieldName(category) {
    if ('by' in category) {
        return `${category.by.toUpperCase()}(${category.field})`;
    }
    return category.field;
}


// Helper function to compute aggregation measure field names
function getMeasureFieldName(measure) {
    return `${measure.function.toUpperCase()}(${measure.field})`;
}


/**
 * Sort data rows
 *
 * @param {Object} chart - The chart model
 * @param {Object[]} data - The data array
 */
export function sortData(chart, data) {
    data.sort((row1, row2) => chart.sorts.reduce((result, sort) => {
        if (result !== 0) {
            return result;
        }
        const value1 = sort.field in row1 ? row1[sort.field] : null;
        const value2 = sort.field in row2 ? row2[sort.field] : null;
        const compare = compareValues(value1, value2);
        return 'desc' in sort && sort.desc ? -compare : compare;
    }, 0));
}


/**
 * Top data rows
 *
 * @param {Object} chart - The chart model
 * @param {Object[]} data - The data array
 * @returns {Object[]} The top data array
 */
export function topData(chart, data) {
    // Bucket rows by category
    const categoryRows = {};
    const categoryOrder = [];
    const categoryFields = 'categoryFields' in chart.top ? chart.top.categoryFields : [];
    for (const row of data) {
        const categoryKey = JSON.stringify(categoryFields.map((field) => (field in row ? row[field] : null)));
        if (!(categoryKey in categoryRows)) {
            categoryRows[categoryKey] = [];
            categoryOrder.push(categoryKey);
        }
        categoryRows[categoryKey].push(row);
    }

    // Take only the top rows
    const dataTop = [];
    const topCount = chart.top.count;
    for (const categoryKey of categoryOrder) {
        const categoryKeyRows = categoryRows[categoryKey];
        const categoryKeyLength = categoryKeyRows.length;
        for (let ixRow = 0; ixRow < topCount && ixRow < categoryKeyLength; ixRow++) {
            dataTop.push(categoryKeyRows[ixRow]);
        }
    }

    return dataTop;
}
