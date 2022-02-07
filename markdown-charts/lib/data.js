// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/data */

import {getBaseURL, isRelativeURL} from '../../markdown-model/lib/elements.js';
import {parseCSV, parseCSVDatetime, parseCSVNumber} from './csv.js';
import {compareValues} from './util.js';
import {encodeMarkdownText} from '../../markdown-model/lib/parser.js';
import {evaluateExpression} from '../../calc-script/lib/runtime.js';
import {parseExpression} from '../../calc-script/lib/parser.js';


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
 * @param {Object} chartModel - The chart model
 * @param {module:lib/util~ChartOptions} [options={}] - Chart options object
 * @returns {module:lib/data~LoadChartDataResult}
 */
export async function loadChartData(chartModel, options = {}) {
    // Compute the variable values
    const variables = {
        'markdownEncode': ([text]) => encodeMarkdownText(text),
        ...('variables' in chartModel ? computeVariables(chartModel.variables) : {}),
        ...('variables' in options ? options.variables : {})
    };

    // Load the data resources
    let {data, types} = await loadData(chartModel.data, options.fetchFn, ('url' in options ? options.url : null), variables);

    // Add calculated fields
    if ('calculatedFields' in chartModel) {
        for (const calculatedField of chartModel.calculatedFields) {
            types[calculatedField.name] = addCalculatedField(data, calculatedField.name, calculatedField.expression, variables);
        }
    }

    // Filter the data
    if ('filter' in chartModel) {
        data = filterData(data, chartModel.filter, variables);
    }

    // Aggregate the data
    if ('aggregation' in chartModel) {
        ({data, types} = aggregateData(chartModel.aggregation, data, types));
    }

    // Add the post-aggregation calculated fields
    if ('postCalculatedFields' in chartModel) {
        for (const calculatedField of chartModel.postCalculatedFields) {
            types[calculatedField.name] = addCalculatedField(data, calculatedField.name, calculatedField.expression, variables);
        }
    }

    // Sort the data
    if ('sorts' in chartModel) {
        sortData(chartModel.sorts, data);
    }

    // Top the data
    if ('top' in chartModel) {
        data = topData(chartModel.top, data);
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
 * @param {Object} dataModel - The data model
 * @param {module:lib/util~FetchFn} fetchFn - The URL fetch function
 * @param {string} [rootURL = null] - The root URL for determining relative data URL locations
 * @param {Object} [variables = null] - Map of variables to variable value
 * @returns {module:lib/data~LoadDataResult}
 */
export async function loadData(dataModel, fetchFn, rootURL = null, variables = null) {
    // Load the data resources
    const fixDataURL = (url) => {
        if (rootURL !== null && isRelativeURL(url)) {
            return `${getBaseURL(rootURL)}${url}`;
        }
        return url;
    };
    const dataBases = [dataModel, ...('joins' in dataModel ? dataModel.joins : [])];
    const dataURLs = dataBases.map((base) => fixDataURL(base.url));
    const dataResponses = await Promise.all(dataURLs.map((joinURL) => fetchFn(joinURL)));
    const dataTypes = await Promise.all(dataResponses.map((response, ixResponse) => dataResponseHandler(dataURLs[ixResponse], response)));

    // Join the data
    let [{data}] = dataTypes;
    const [{types}] = dataTypes;
    if ('joins' in dataModel) {
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
        for (let ixJoin = 0; ixJoin < dataModel.joins.length; ixJoin++) {
            const join = dataModel.joins[ixJoin];
            const {'left': isLeftJoin = false} = join;
            const leftExpression = parseExpression(join.leftExpression);
            const rightExpression = parseExpression('rightExpression' in join ? join.rightExpression : join.leftExpression);
            const rightData = dataTypes[ixJoin + 1].data;
            const rightTypes = dataTypes[ixJoin + 1].types;

            // Bucket the right rows by the right expression value
            const rightCategoryRows = {};
            for (const row of rightData) {
                const categoryKey = JSON.stringify(evaluateExpression(rightExpression, variables, row));
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
                const categoryKey = JSON.stringify(evaluateExpression(leftExpression, variables, row));
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
 * Compute a variable expression map
 *
 * @param {Object} variables - The variable expression map
 * @param {Object} [globals = {}] - The global variables
 * @returns {Object} The map of variable values
 */
export function computeVariables(variables, globals = {}) {
    const variableValues = {};

    // Compute each variable expression
    for (const varName of Object.keys(variables)) {
        const varExpr = parseExpression(variables[varName]);
        variableValues[varName] = evaluateExpression(varExpr, globals, variableValues);
    }

    return variableValues;
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

    // Compute the calculated fields for each row
    let calcType = null;
    for (const row of data) {
        const calcValue = evaluateExpression(calcExpr, variables, row);
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

    // Filter the data
    const filteredData = [];
    for (const row of data) {
        if (evaluateExpression(filterExpr, variables, row)) {
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
 * @returns {module:lib/data~LoadDataResult}
 */
export function aggregateData(aggregationModel, data, types) {
    // Compute the aggregate field types
    const aggregateTypes = {};
    for (const categoryField of aggregationModel.categoryFields) {
        if (!(categoryField in types)) {
            throw new Error(`Unknown aggregation category field "${categoryField}"`);
        }
        aggregateTypes[categoryField] = types[categoryField];
    }
    for (const measure of aggregationModel.measures) {
        if (!(measure.field in types)) {
            throw new Error(`Unknown aggregation category field "${measure.field}"`);
        }
        if ((measure.function === 'Average' || measure.function === 'Sum') && types[measure.field] !== 'number') {
            throw new Error(`Invalid aggregation measure function "${measure.function}" ` +
                            `for field "${measure.field}" (type "${types[measure.field]}")`);
        }
        const measureName = ('name' in measure ? measure.name : measure.field);
        aggregateTypes[measureName] = types[measure.field];
    }

    // Create the aggregate rows
    const measureRows = {};
    for (const row of data) {
        // Compute the category values
        const categoryValues = aggregationModel.categoryFields.map((categoryField) => row[categoryField]);

        // Get or create the aggregate row
        let aggregateRow;
        const rowKey = JSON.stringify(categoryValues);
        if (rowKey in measureRows) {
            aggregateRow = measureRows[rowKey];
        } else {
            aggregateRow = {};
            measureRows[rowKey] = aggregateRow;
            for (let ixCategoryField = 0; ixCategoryField < aggregationModel.categoryFields.length; ixCategoryField++) {
                aggregateRow[aggregationModel.categoryFields[ixCategoryField]] = categoryValues[ixCategoryField];
            }
        }

        // Add to the aggregate measure values
        for (const measure of aggregationModel.measures) {
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
        for (const measure of aggregationModel.measures) {
            const measureName = ('name' in measure ? measure.name : measure.field);
            const measureValues = measureName in aggregateRow ? aggregateRow[measureName] : null;
            const measureFunction = measure.function;
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
    const categoryFields = 'categoryFields' in topModel ? topModel.categoryFields : [];
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
