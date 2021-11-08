// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

import {SchemaMarkdownParser, validateType} from '../../schema-markdown/index.js';


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

    # The chart width
    optional int(> 0) width

    # The chart height
    optional int(> 0) height

    # The data resource URL. The data resource is formatted as a JSON array of row objects.
    string dataURL

    # Optional array of filters. Omit any row that does not match all filters.
    optional Filter[len > 0] filters

    # Optional data aggregation
    optional Aggregation aggregation

    # Chart title
    optional string title

    # Numeric formatting precision (default is 2)
    optional int(>= 0) precision

    # Datetime format (default is "Auto")
    optional DatetimeFormat datetime

    # The map of variable name to variable value
    optional FieldValue{len > 0} variables


# A bar chart specification
struct BarChart (ChartBase)

    # The bar chart's category fields. If there is more than one category field, the chart is
    # color-encoded by category value, and the "colorFields" member must not be present.
    optional string[len > 0] categoryFields

    # The bar chart's measure fields
    string[len > 0] measureFields

    # The color encoding fields. Color encode based on the color fields' values.
    optional string[len > 0] colorFields

    # If true, render the color encoding using a stacked bar chart. Otherwise, render the color
    # encoding using separate colored bars.
    optional bool stacked

    # If true, the bar chart is rendered "reversed". The default is false.
    optional bool reversed


# A data table specification
struct DataTable (ChartBase)

    # The data table's category field names
    string[len > 0] categories

    # The data table's measure field names
    string[len > 0] measures


# A line chart specification
struct LineChart (ChartBase)

    # The line chart's X-axis field
    string xField

    # The line chart's Y-axis fields. If there is more than one Y-axis field, the chart is
    # color-encoded by field name, and the "colorFields" member must not be present.
    string[len > 0] yFields

    # The color encoding fields. Render a colored line for each of the fields' values.
    optional string[len > 0] colorFields

    # The number of X-axis tick marks, including the beginning and end ticks. The default is 3.
    optional int(>= 0) xTickCount

    # The number of Y-axis tick marks, including the beginning and end ticks. The default is 3.
    optional int(>= 0) yTickCount

    # The X-axis tick mark specification
    optional AxisTicks xTicks

    # The Y-axis tick mark specification
    optional AxisTicks yTicks


# Datetime format enumeration
enum DatetimeFormat

    # ISO datetime format with automatic trimming
    Auto

    # ISO datetime day format
    Day


# An axis tick mark specification
union AxisTicks

    # Automatically-generated, evenly-spaced tick marks
    AxisTicksAuto auto

    # The array of tick mark field values
    AxisTickValue[] values


# Automatically-generated, evenly-spaced tick marks specification
struct AxisTicksAuto

    # The number of tick marks
    int count

    # The number of tick mark labels to skip after a rendered label
    optional int(> 0) skip


# A tick mark value
struct AxisTickValue

    # The tick mark field value
    FieldValue value

    # The tick mark's label
    optional string label


# Field value union
union FieldValue

    # A datetime value
    datetime datetime

    # A number value
    float number

    # A string value
    string string


# A data row filter
union Filter

    # The datetime field filter
    DatetimeFilter datetime

    # The number field filter
    NumberFilter number

    # The string field filter
    StringFilter string


# The typed filter base structure
struct FilterBase

    # The filter field name
    string field

    # Matches if the field value is in the variable array (or matches "in")
    optional string[len > 0] vin

    # Matches if the field value is NOT in the variable array (or matches "except")
    optional string[len > 0] vexcept

    # Matches if the field value is less than the variable value
    optional string vlt

    # Matches if the field value is less than or equal to the variable value
    optional string vlte

    # Matches if the field value is greater than the variable value
    optional string vgt

    # Matches if the field value is greater than or equal to the variable value
    optional string vgte


# A datetime field filter. All members present must match for the filter to match.
struct DatetimeFilter (FilterBase)

    # Matches if the field value is in the value array (or matches "vin")
    optional datetime[len > 0] in

    # Matches if the field value is NOT in the value array (or matches "vexcept")
    optional datetime[len > 0] except

    # Matches if the field value is less than the value
    optional datetime lt

    # Matches if the field value is less than or equal to the value
    optional datetime lte

    # Matches if the field value is greater than the value
    optional datetime gt

    # Matches if the field value is greater than or equal to the value
    optional datetime gte


# A number field filter. All members present must match for the filter to match.
struct NumberFilter (FilterBase)

    # Matches if the field value is in the value array (or matches "vin")
    optional float[len > 0] in

    # Matches if the field value is NOT in the value array (or matches "vexcept")
    optional float[len > 0] except

    # Matches if the field value is less than the value
    optional float lt

    # Matches if the field value is less than or equal to the value
    optional float lte

    # Matches if the field value is greater than the value
    optional float gt

    # Matches if the field value is greater than or equal to the value
    optional float gte


# A string field filter. All members present must match for the filter to match.
struct StringFilter (FilterBase)

    # Matches if the field value is in the value array (or matches "vin")
    optional string[len > 0] in

    # Matches if the field value is NOT in the value array (or matches "vexcept")
    optional string[len > 0] except

    # Matches if the field value is less than the value
    optional string lt

    # Matches if the field value is less than or equal to the value
    optional string lte

    # Matches if the field value is greater than the value
    optional string gt

    # Matches if the field value is greater than or equal to the value
    optional string gte


# A data aggregation specification. The aggregation operation drops all fields other than the
# category fields, the color fields (if any), and the aggregated measure fields (e.g.,
# "SUM(measure)").
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
    AggregationCategorization categorization


# The aggregation category type
enum AggregationCategorization

    # Aggregate on the values of a field
    Field

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


# The aggregation function
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
`;


/**
 * The chart model
 *
 * @property {string} title - The type model title
 * @property {Object} types - The type model's type dictionary
 */
export const chartModel = {
    'title': 'The Chart Model',
    'types': (new SchemaMarkdownParser(chartModelSmd)).types
};
