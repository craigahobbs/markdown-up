// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/data */

import {parseCSV, parseCSVDatetime, parseCSVNumber} from './csv.js';
import {compareValues} from './util.js';
import {escapeMarkdownText} from 'markdown-model/lib/elements.js';
import {evaluateExpression} from 'calc-script/lib/runtime.js';
import {parseExpression} from 'calc-script/lib/parser.js';


/* c8 ignore start */


// Helper function to create the data expression's variables argument
function createDataVariables(chart, variables = null) {
    const dataVariables = {};
    const evalOptions = {'globals': dataVariables};

    // Add the chart model variable expressions
    if (chart !== null && 'var' in chart) {
        for (const varName of Object.keys(chart.var)) {
            const varExpr = parseExpression(chart.var[varName]);
            dataVariables[varName] = evaluateExpression(varExpr, evalOptions);
        }
    }

    // Add the options variables
    if (variables !== null) {
        Object.assign(dataVariables, variables);
    }

    return dataVariables;
}


/**
 * The loadChartData result object
 *
 * @typedef {Object} LoadChartDataResult
 * @property {Object[]} data - The data row object array
 * @property {Object} types - The map of field name to field type ("datetime", "number", "string")
 * @property {Object} variables - The map of computed variable expression values
 */


/**
 * Load the chart's data
 *
 * @async
 * @param {Object} chart - The chart model
 * @param {Object} [options=null] - The [markdown-script options]{@link module:lib/script~MarkdownScriptOptions}
 * @returns [LoadChartDataResult]{@link module:lib/data~LoadChartDataResult}
 */
export async function loadChartData(chart, options = null) {
    // Load the data resources
    let {data, types} = await loadData(chart.data, options);

    // Compute the data variable values
    const variables = createDataVariables(chart, options !== null ? options.variables : null);

    // Add calculated fields
    if ('calc' in chart) {
        for (const calculatedField of chart.calc) {
            types[calculatedField.name] = addCalculatedField(data, calculatedField.name, calculatedField.expr, variables);
        }
    }

    // Filter the data
    if ('filter' in chart) {
        data = filterData(data, chart.filter, variables);
    }

    // Aggregate the data
    if ('agg' in chart) {
        ({data, types} = aggregateData(chart.agg, data, types));
    }

    // Add the post-aggregation calculated fields
    if ('aggcalc' in chart) {
        for (const calculatedField of chart.aggcalc) {
            types[calculatedField.name] = addCalculatedField(data, calculatedField.name, calculatedField.expr, variables);
        }
    }

    // Sort the data
    if ('sort' in chart) {
        sortData(chart.sort, data);
    }

    // Top the data
    if ('top' in chart) {
        data = topData(chart.top, data);
    }

    return {data, types, variables};
}


/**
 * The loadData result object
 *
 * @typedef {Object} LoadDataResult
 * @property {Object[]} data - The data row object array
 * @property {Object} types - The map of field name to field type ("datetime", "number", "string")
 */


/**
 * Load a data model
 *
 * @async
 * @param {Object} dataModel - The data model
 * @param {Object} options - The [markdown-script options]{@link module:lib/script~MarkdownScriptOptions}
 * @returns [LoadDataResult]{@link module:lib/data~LoadDataResult}
 */
export async function loadData(dataModel, options) {
    const dataBases = [dataModel, ...('join' in dataModel ? dataModel.join : [])];
    const dataURLs = dataBases.map((base) => base.url);
    const dataResponses = await Promise.all(dataURLs.map((joinURL) => options.fetchFn(options.urlFn(joinURL))));
    const dataTypes = await Promise.all(dataResponses.map((response, ixResponse) => dataResponseHandler(dataURLs[ixResponse], response)));

    // Compute the data variable values
    const dataVariables = options.variables ?? createDataVariables(null);
    const evalOptions = {'globals': dataVariables};

    // Join the data
    let [{data}] = dataTypes;
    const [{types}] = dataTypes;
    if ('join' in dataModel) {
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
        for (let ixJoin = 0; ixJoin < dataModel.join.length; ixJoin++) {
            const join = dataModel.join[ixJoin];
            const {'leftJoin': isLeftJoin = false} = join;
            const leftExpression = parseExpression(join.left);
            const rightExpression = parseExpression('right' in join ? join.right : join.left);
            const rightData = dataTypes[ixJoin + 1].data;
            const rightTypes = dataTypes[ixJoin + 1].types;

            // Bucket the right rows by the right expression value
            const rightCategoryRows = {};
            for (const row of rightData) {
                const categoryKey = JSON.stringify(evaluateExpression(rightExpression, evalOptions, row));
                if (!(categoryKey in rightCategoryRows)) {
                    rightCategoryRows[categoryKey] = [];
                }
                rightCategoryRows[categoryKey].push(row);
            }

            // Compute the right column names
            const rightFieldMap = Object.fromEntries(Object.keys(rightTypes).map(mapFieldName));
            for (const rightField of Object.keys(rightTypes)) {
                types[rightFieldMap[rightField]] = rightTypes[rightField];
            }

            // Join the left with the right
            leftData = data;

            data = [];
            for (const row of leftData) {
                const categoryKey = JSON.stringify(evaluateExpression(leftExpression, evalOptions, row));
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
                } else if (!isLeftJoin) {
                    data.push(row);
                }
            }
        }
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
    const types = validateData(data, csv);

    return {data, types};
}


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


/**
 * Add a calculated field to each row of a data array
 *
 * @param {Object[]} data - The data array. Row objects are updated with the calculated field values.
 * @param {string} name - The calculated field name
 * @param {string} expr - The calculated field expression
 * @param {Object} [variables = null] - Map of variables to variable value
 * @returns {string} The field type ("datetime", "number", "string")
 */
export function addCalculatedField(data, name, expr, variables = null) {
    // Parse the calculation expression
    const calcExpr = parseExpression(expr);

    // Compute the data variable values
    const dataVariables = variables ?? createDataVariables(null);
    const evalOptions = {'globals': dataVariables};

    // Compute the calculated fields for each row
    let calcType = null;
    for (const row of data) {
        const calcValue = evaluateExpression(calcExpr, evalOptions, row);
        row[name] = calcValue;

        // Determine the calculated field type
        if (calcValue !== null && calcType === null) {
            calcType = getCalculatedValueType(calcValue);
        }
    }

    return calcType !== null ? calcType : 'string';
}


/**
 * Get an computed expression value's type
 *
 * @param {*} value - The computed expression value
 * @returns {string} The field type ("datetime", "number", "string")
 */
export function getCalculatedValueType(value) {
    if (typeof value === 'number' || typeof value === 'boolean') {
        return 'number';
    } else if (value instanceof Date) {
        return 'datetime';
    }
    return 'string';
}


/**
 * Filter data rows
 *
 * @param {Object[]} data - The data array. Row objects are updated with parsed/validated values.
 * @param {string} expr - The boolean filter expression
 * @param {Object} [variables = null] - Map of variables to variable value
 * @returns {Object[]} The filtered data array
 */
export function filterData(data, expr, variables = null) {
    // Parse the filter expression
    const filterExpr = parseExpression(expr);

    // Compute the data variable values
    const dataVariables = variables ?? createDataVariables(null);
    const evalOptions = {'globals': dataVariables};

    // Filter the data
    const filteredData = [];
    for (const row of data) {
        if (evaluateExpression(filterExpr, evalOptions, row)) {
            filteredData.push(row);
        }
    }
    return filteredData;
}


/**
 * Aggregate data rows
 *
 * @param {Object} aggregationModel - The aggregation model
 * @param {Object[]} data - The data array
 * @param {Object} types - The map of field name to field type ("datetime", "number", "string")
 * @returns [LoadDataResult]{@link module:lib/data~LoadDataResult}
 */
export function aggregateData(aggregationModel, data, types) {
    // Compute the aggregate field types
    const aggregateTypes = {};
    for (const categoryField of aggregationModel.category) {
        if (!(categoryField in types)) {
            throw new Error(`Unknown aggregation category field "${categoryField}"`);
        }
        aggregateTypes[categoryField] = types[categoryField];
    }
    for (const measure of aggregationModel.measure) {
        if (!(measure.field in types)) {
            throw new Error(`Unknown aggregation category field "${measure.field}"`);
        }
        if ((measure.func === 'Average' || measure.func === 'Sum') && types[measure.field] !== 'number') {
            throw new Error(`Invalid aggregation measure function "${measure.func}" ` +
                            `for field "${measure.field}" (type "${types[measure.field]}")`);
        }
        const measureName = ('name' in measure ? measure.name : measure.field);
        aggregateTypes[measureName] = types[measure.field];
    }

    // Create the aggregate rows
    const measureRows = {};
    for (const row of data) {
        // Compute the category values
        const categoryValues = aggregationModel.category.map((categoryField) => row[categoryField]);

        // Get or create the aggregate row
        let aggregateRow;
        const rowKey = JSON.stringify(categoryValues);
        if (rowKey in measureRows) {
            aggregateRow = measureRows[rowKey];
        } else {
            aggregateRow = {};
            measureRows[rowKey] = aggregateRow;
            for (let ixCategoryField = 0; ixCategoryField < aggregationModel.category.length; ixCategoryField++) {
                aggregateRow[aggregationModel.category[ixCategoryField]] = categoryValues[ixCategoryField];
            }
        }

        // Add to the aggregate measure values
        for (const measure of aggregationModel.measure) {
            const measureName = ('name' in measure ? measure.name : measure.field);
            const value = (measure.field in row ? row[measure.field] : null);
            if (value !== null) {
                if (!(measureName in aggregateRow)) {
                    aggregateRow[measureName] = [];
                }
                aggregateRow[measureName].push(value);
            }
        }
    }

    // Compute the measure values aggregate function value
    const aggregateRows = Object.values(measureRows);
    for (const aggregateRow of aggregateRows) {
        for (const measure of aggregationModel.measure) {
            const measureName = ('name' in measure ? measure.name : measure.field);
            const measureValues = measureName in aggregateRow ? aggregateRow[measureName] : null;
            const measureFunction = measure.func;
            if (measureValues === null) {
                aggregateRow[measureName] = null;
            } else if (measureFunction === 'Average') {
                aggregateRow[measureName] = measureValues.reduce((sum, val) => sum + val) / measureValues.length;
            } else if (measureFunction === 'Count') {
                aggregateRow[measureName] = measureValues.length;
            } else if (measureFunction === 'Max') {
                aggregateRow[measureName] = measureValues.reduce((max, val) => (val > max ? val : max));
            } else if (measureFunction === 'Min') {
                aggregateRow[measureName] = measureValues.reduce((min, val) => (val < min ? val : min));
            } else if (measureFunction === 'Sum') {
                aggregateRow[measureName] = measureValues.reduce((sum, val) => sum + val);
            }
        }
    }

    return {'data': aggregateRows, 'types': aggregateTypes};
}


/**
 * Sort data rows
 *
 * @param {Object} sortModels - The sort model array
 * @param {Object[]} data - The sorted data array
 */
export function sortData(sortModels, data) {
    data.sort((row1, row2) => sortModels.reduce((result, sort) => {
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
 * @param {Object} topModel - The top model
 * @param {Object[]} data - The data array
 * @returns {Object[]} The top data array
 */
export function topData(topModel, data) {
    // Bucket rows by category
    const categoryRows = {};
    const categoryOrder = [];
    const categoryFields = 'category' in topModel ? topModel.category : [];
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
    const topCount = topModel.count;
    for (const categoryKey of categoryOrder) {
        const categoryKeyRows = categoryRows[categoryKey];
        const categoryKeyLength = categoryKeyRows.length;
        for (let ixRow = 0; ixRow < topCount && ixRow < categoryKeyLength; ixRow++) {
            dataTop.push(categoryKeyRows[ixRow]);
        }
    }

    return dataTop;
}
