// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/model */

import {parseSchemaMarkdown} from '../schema-markdown/lib/parser.js';
import {validateType} from '../schema-markdown/lib/schema.js';


/**
 * Validate a bar chart model
 *
 * @param {Object} barChart - The bar chart model
 * @returns {Object}
 */
export function validateBarChart(barChart) {
    return validateType(chartTypes, 'BarChart', barChart);
}


/**
 * Validate a data table model
 *
 * @param {Object} dataTable - The data table model
 * @returns {Object}
 */
export function validateDataTable(dataTable) {
    return validateType(chartTypes, 'DataTable', dataTable);
}


/**
 * Validate a line chart model
 *
 * @param {Object} lineChart - The line chart model
 * @returns {Object}
 */
export function validateLineChart(lineChart) {
    return validateType(chartTypes, 'LineChart', lineChart);
}


/**
 * The chart model
 */
export const chartTypes = parseSchemaMarkdown(`\
# Base struct for all chart types
struct ChartBase

    # The data specification
    Data data

    # The map of variable name to variable expression
    optional string{len > 0} var

    # The calculated fields
    optional CalculatedField[len > 0] calc

    # The data row boolean filter expression. Omit any row that does not match.
    optional string filter

    # The data aggregation specification
    optional Aggregation agg

    # The post-aggregation calculated fields
    optional CalculatedField[len > 0] aggcalc

    # The data's sort specification
    optional SortField[len > 0] sort

    # The data's top specification
    optional Top top

    # The numeric formatting precision (default is 2)
    optional int(>= 0) precision

    # The datetime format
    optional DatetimeFormat datetime


# A chart data specification
struct Data

    # The data resource URL. The data resource is formatted either as a CSV or as a JSON array of row objects.
    string url

    # Data joins
    optional DataJoin[len > 0] join


# A data join specification
struct DataJoin

    # The data resource URL. The data resource is formatted either as a CSV or as a JSON array of row objects.
    string url

    # If true, the join is a left join (default is right join)
    optional bool leftJoin

    # The join expression for the left row
    string left

    # The join expression for the right row
    optional string right


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

    # The calculated field name
    string name

    # The calculation expression
    string expr


# A data aggregation specification
struct Aggregation

    # The aggregation category fields
    string[len > 0] category

    # The aggregation measures
    AggregationMeasure[len > 0] measure


# An aggregation measure specification
struct AggregationMeasure

    # The aggregated-measure field name
    optional string name

    # The aggregation measure field
    string field

    # The aggregation function
    AggregationFunction func


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


# A sort field specification
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
    optional string[len > 0] category


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
    string[len > 0] measure

    # The bar category fields
    optional string[len > 0] bar

    # The category fields
    optional string[len > 0] category

    # The color encoding field
    optional string[len > 0] color

    # If true, the bar chart is rendered "reversed". The default is false.
    optional bool reverse


# A data table specification
struct DataTable (ChartBase)

    # The table's category fields
    optional string[len > 0] category

    # The table's fields
    optional string[len > 0] field

    # The "categoryFields" and "fields" to be rendered as Markdown text
    optional string[len > 0] markdown


# A line chart specification
struct LineChart (ChartCommon, ChartBase)

    # The line chart's X-axis field
    string x

    # The line chart's Y-axis fields
    string[len > 0] y

    # The color encoding field
    optional string color

    # The X-axis tick mark specification
    optional AxisTicks xtick

    # The Y-axis tick mark specification
    optional AxisTicks ytick

    # The X-axis annotations
    optional AxisAnnotation[len > 0] xline

    # The Y-axis annotations
    optional AxisAnnotation[len > 0] yline


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
`);
