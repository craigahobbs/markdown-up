// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/model */

import {SchemaMarkdownParser} from '../../schema-markdown/lib/parser.js';
import {validateType} from '../../schema-markdown/lib/schema.js';


/**
 * Validate a bar chart model
 *
 * @param {Object} barChart - The bar chart model
 * @returns {Object}
 */
export function validateBarChart(barChart) {
    return validateType(chartModel.types, 'BarChart', barChart);
}


/**
 * Validate a data table model
 *
 * @param {Object} dataTable - The data table model
 * @returns {Object}
 */
export function validateDataTable(dataTable) {
    return validateType(chartModel.types, 'DataTable', dataTable);
}


/**
 * Validate a line chart model
 *
 * @param {Object} lineChart - The line chart model
 * @returns {Object}
 */
export function validateLineChart(lineChart) {
    return validateType(chartModel.types, 'LineChart', lineChart);
}


/**
 * The chart model defined using Schema Markdown
 */
export const chartModelSmd = `\
# Base struct for all chart types
struct ChartBase

    # The data specification
    Data data

    # The map of variable name to variable expression
    optional string{len > 0} variables

    # The calculated fields
    optional CalculatedField[len > 0] calculatedFields

    # The data row boolean filter expressions. Omit any row that does not match all filters.
    optional string[len > 0] filters

    # The data aggregation specification
    optional Aggregation aggregation

    # The post-aggregation calculated fields
    optional CalculatedField[len > 0] postCalculatedFields

    # The data's sort specification
    optional SortField[len > 0] sorts

    # The data's top specification
    optional Top top

    # The numeric formatting precision (default is 2)
    optional int(>= 0) precision

    # The datetime format
    optional DatetimeFormat datetime


# Base chart data specification struct
struct DataBase

    # The data resource URL. The data resource is formatted either as a CSV or as a JSON array of row objects.
    string url

    # The pre-join calculated fields
    optional CalculatedField[len > 0] preCalculatedFields


# A chart data specification
struct Data (DataBase)

    # Data joins
    optional DataJoin[len > 0] joins


# A data join specification
struct DataJoin (DataBase)

    # If true, the join is a left join (default is right join)
    optional bool left

    # The left field of the join
    string[len > 0] leftFields

    # The right field of the join
    optional string[len > 0] rightFields


# A datetime format
enum DatetimeFormat

    # ISO datetime year format
    Year

    # ISO datetime month format
    Month

    # ISO datetime day format
    Day


# A calculated field specification
struct CalculatedField

    # The field name
    string name

    # The calculation expression
    string expression


# A data aggregation specification. The aggregated data rows are comprised of the generated
# aggregation category and measure fields (e.g. "SUM(measure)").
struct Aggregation

    # The aggregation category fields
    string[len > 0] categoryFields

    # The aggregation measures
    AggregationMeasure[len > 0] measures


# An aggregation measure specification
struct AggregationMeasure

    # The aggregation measure field
    string field

    # The aggregation function
    AggregationFunction function


# An aggregation function
enum AggregationFunction

    # The average of the measure's values
    Average

    # The count of the measure's values
    Count

    # The greatest of the measure's values
    Max

    # The least of the measure's values
    Min

    # The sum of the measure's values
    Sum


# A sort's field specification
struct SortField

    # The field to sort by
    string field

    # If true, sort this field in descending order
    optional bool desc


# A data top specification
struct Top

    # The maximum number of rows to keep per category
    optional int(> 0) count

    # The category fields
    optional string[len > 0] categoryFields


# Base struct for line and bar charts
struct ChartCommon

    # The chart title expression
    optional string title

    # The chart width expression
    optional string width

    # The chart height expression
    optional string height


# A bar chart specification
struct BarChart (ChartCommon, ChartBase)

    # The bar measure fields
    string[len > 0] measureFields

    # The bar category fields
    optional string[len > 0] barFields

    # The category fields
    optional string[len > 0] categoryFields

    # The color encoding fields
    optional string[len > 0] colorFields

    # If true, the bar chart is rendered "reversed". The default is false.
    optional bool reversed


# A data table specification
struct DataTable (ChartBase)

    # The table's category fields
    optional string[len > 0] categoryFields

    # The table's fields
    optional string[len > 0] fields

    # The "categoryFields" and "fields" to be rendered as Markdown text
    optional string[len > 0] markdownFields


# A line chart specification
struct LineChart (ChartCommon, ChartBase)

    # The line chart's X-axis field
    string xField

    # The line chart's Y-axis fields
    string[len > 0] yFields

    # The color encoding fields. Render a colored line for each of the fields' values.
    optional string[len > 0] colorFields

    # The X-axis tick mark specification
    optional AxisTicks xTicks

    # The Y-axis tick mark specification
    optional AxisTicks yTicks

    # The X-axis annotations
    optional AxisAnnotation[len > 0] xAnnotations

    # The Y-axis annotations
    optional AxisAnnotation[len > 0] yAnnotations


# An axis annotation
struct AxisAnnotation

    # The axis field value expression
    string value

    # The annotation label expression
    optional string label


# Automatically-generated, evenly-spaced tick marks specification
struct AxisTicks

    # The tick mark count expression. Default is 3.
    optional string count

    # The field value expression of the first tick mark. Default is the minimum field value.
    optional string start

    # The field value expression of the last tick mark. Default is the maximum field value.
    optional string end

    # The number of tick mark labels to skip after a rendered label
    optional int(> 0) skip
`;


/**
 * The chart model
 *
 * @property {string} title - The model's title
 * @property {Object} types - The model's referenced types dictionary
 */
export const chartModel = {
    'title': 'The Chart Model',
    'types': (new SchemaMarkdownParser(chartModelSmd)).types
};
