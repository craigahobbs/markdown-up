// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/model */

import {SchemaMarkdownParser, validateType} from '../../../schema-markdown/index.js';


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


// The chart model defined using Schema Markdown
const chartModelSmd = `\
# Base struct for all chart types
struct ChartBase

    # The data specification
    Data data

    # The map of variable name to variable value
    optional FieldValue{len > 0} variables

    # The data row filters. Omit any row that does not match all filters.
    optional Filter[len > 0] filters

    # The data aggregation specification
    optional Aggregation aggregation

    # The data's sort specification
    optional SortField[len > 0] sorts

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
    optional DataJoin[len > 0] joins


# A data join specification
struct DataJoin

    # The data resource URL. The data resource is formatted either as a CSV or as a JSON array of row objects.
    string url

    # The left field of the join
    string[len > 0] leftFields

    # The right field of the join
    optional string[len > 0] rightFields


# Base struct for line and bar charts
struct ChartCommon

    # The chart title
    optional string title

    # The chart width
    optional int(> 0) width

    # The chart height
    optional int(> 0) height


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

    # The table's links
    optional Link[len > 0] links


# A link specification
struct Link

    # The link name
    string name

    # The link text
    LinkText text

    # The link URL
    LinkText url


# A link text specification
union LinkText

    # A row-field-formatted string
    string string

    # A row field value
    string field


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

    # The axis field value
    FieldValueEx value

    # The annotation label
    optional string label


# A datetime format
enum DatetimeFormat

    # ISO datetime year format
    Year

    # ISO datetime month format
    Month

    # ISO datetime day format
    Day


# Automatically-generated, evenly-spaced tick marks specification
struct AxisTicks

    # The number of tick marks. Default is 3.
    optional int count

    # The field value of the first tick mark. Default is the minimum field value.
    optional FieldValueEx start

    # The field value of the last tick mark. Default is the maximum field value.
    optional FieldValueEx end

    # The number of tick mark labels to skip after a rendered label
    optional int(> 0) skip


# A field value
union FieldValue

    # A datetime value
    datetime datetime

    # A number value
    float number

    # A string value
    string string

    # A live-computed value
    LiveValue live


# A field value with variable value
union FieldValueEx (FieldValue)

    # The variable name
    string variable


# A live-computed value
struct LiveValue

    # The live value type
    LiveValueType value

    # The live value index (i.e. -1 for "Year" means last year)
    optional int index


# The live-computed value type
enum LiveValueType

    # Return the current datetime
    Now

    # Return today's datetime
    Today

    # Return this month's datetime
    Month

    # Return this year's datetime
    Year


# A data row filter specification
struct Filter

    # The filter field
    string field

    # Matches if the field value is in the value array
    optional FieldValueEx[len > 0] includes

    # Matches if the field value is NOT in the value array
    optional FieldValueEx[len > 0] excludes

    # Matches if the field value is less than the value
    optional FieldValueEx lt

    # Matches if the field value is less than or equal to the value
    optional FieldValueEx lte

    # Matches if the field value is greater than the value
    optional FieldValueEx gt

    # Matches if the field value is greater than or equal to the value
    optional FieldValueEx gte


# A data aggregation specification. The aggregated data rows are comprised of the generated
# aggregation category and measure fields (e.g. "SUM(measure)").
struct Aggregation

    # The aggregation categories
    AggregationCategory[len > 0] categories

    # The aggregation measures
    AggregationMeasure[len > 0] measures


# An aggregation category specification
struct AggregationCategory

    # The aggregation category field
    string field

    # The aggregation category's categorization
    optional AggregationCategorization by


# An aggregation category type
enum AggregationCategorization

    # Aggregate on the year values of a datetime field
    Year

    # Aggregate on the month values of a datetime field
    Month

    # Aggregate on the day values of a datetime field
    Day

    # Aggregate on the hour values of a datetime field
    Hour


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
`;


/**
 * The chart model
 *
 * @property {string} title - The type model title
 * @property {Object} types - The chart model's referenced types dictionary
 */
export const chartModel = {
    'title': 'The Chart Model',
    'types': (new SchemaMarkdownParser(chartModelSmd)).types
};
