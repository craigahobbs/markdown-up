// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/lineChart */

import {formatValue, parameterValue, valueParameter} from './dataUtil.js';
import {parseSchemaMarkdown} from '../schema-markdown/lib/parser.js';
import {validateType} from '../schema-markdown/lib/schema.js';
import {valueCompare} from '../bare-script/lib/value.js';


// The line chart model's Schema Markdown
export const lineChartTypes = parseSchemaMarkdown(`\
group "Line Chart"


# A line chart model
struct LineChart

    # The chart title
    optional string title

    # The chart width
    optional int width

    # The chart height
    optional int height

    # The numeric formatting precision (default is 2)
    optional int(>= 0) precision

    # The datetime format
    optional LineChartDatetimeFormat datetime

    # The line chart's X-axis field
    string x

    # The line chart's Y-axis fields
    string[len > 0] y

    # The color encoding field
    optional string color

    # The color encoding value order
    optional string[len > 0] colorOrder

    # The X-axis tick marks
    optional LineChartAxisTicks xTicks

    # The Y-axis tick marks
    optional LineChartAxisTicks yTicks

    # The X-axis annotations
    optional LineChartAxisAnnotation[len > 0] xLines

    # The Y-axis annotations
    optional LineChartAxisAnnotation[len > 0] yLines


# The axis tick mark model
struct LineChartAxisTicks

    # The count of evenly-spaced tick marks. The default is 3.
    optional int(>= 0) count

    # The value of the first tick mark. Default is the minimum axis value.
    optional any start

    # The value of the last tick mark. Default is the maximum axis value.
    optional any end

    # The number of tick mark labels to skip after a rendered label
    optional int(> 0) skip


# An axis annotation
struct LineChartAxisAnnotation

    # The axis value
    any value

    # The annotation label
    optional string label


# A datetime format
enum LineChartDatetimeFormat

    # ISO datetime year format
    year

    # ISO datetime month format
    month

    # ISO datetime day format
    day
`);


/**
 * Validate a line chart model
 *
 * @param {Object} lineChart - The
 *     [line chart model]{@link https://craigahobbs.github.io/markdown-up/library/model.html#var.vName='LineChart'}
 * @returns {Object}
 * @throws [ValidationError]{@link https://craigahobbs.github.io/schema-markdown-js/module-lib_schema.ValidationError.html}
 */
export function validateLineChart(lineChart) {
    return validateType(lineChartTypes, 'LineChart', lineChart);
}


// Line chart defaults
const defaultWidth = 640;
const defaultHeight = 320;
const defaultXAxisTickCount = 3;
const defaultYAxisTickCount = 3;


// The categorical color palette
const categoricalColors = [
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


// Line chart constants (all numbers in pixels)
const pixelsPerPoint = 4 / 3;
const svgPrecision = 3;
const chartFontFamily = 'Arial, Helvetica, sans-serif';
const chartFontWidthRatio = 0.6;
const chartFontDefaultSize = 12;
const chartBackgroundColor = 'white';
const axisColor = 'black';
const axisTickLineColor = 'lightgray';
const axisLineWidth = 1;
const axisTickWidth = 1;
const axisTickLength = 5;
const annotationBackgroundColor = '#ffffffa0';
const annotationTextColor = 'black';
const annotationLineColor = 'black';
const annotationLineWidth = 2;
const chartLineWidth = 3;


/**
 * The line chart options object
 *
 * @typedef {Object} LineChartOptions
 * @property {number} [fontSize] - The font size, in points
 */


/**
 * Render a line chart
 *
 * @param {Object[]} data - The data array
 * @param {Object} lineChart - The
 *     [line chart model]{@link https://craigahobbs.github.io/markdown-up/library/model.html#var.vName='LineChart'}
 * @param {?Object} [options = null] - The [line chart options]{@link module:lib/lineChart~LineChartOptions}
 * @returns {Object} The line chart [element model]{@link https://github.com/craigahobbs/element-model#readme}
 */
export function lineChartElements(data, lineChart, options = null) {
    const chartFontSize = pixelsPerPoint * (options !== null && 'fontSize' in options ? options.fontSize : chartFontDefaultSize);
    const xField = lineChart.x;
    const yFields = lineChart.y;
    const colorField = lineChart.color ?? null;
    const colorOrder = lineChart.colorOrder ?? null;

    // Sort the rows by the X field
    data.sort((row1, row2) => {
        const x1 = row1[xField] ?? null;
        const x2 = row2[xField] ?? null;
        return valueCompare(x1, x2);
    });

    // Generate the line points - [(label, color, points), ...]
    const linePoints = [];
    let xMin = null;
    let yMin = null;
    let xMax = null;
    let yMax = null;
    if (colorField !== null) {
        // Determine the set of color encoding values
        const colorValueSet = new Set();
        const pointsMap = {};
        for (const row of data) {
            for (const yField of yFields) {
                const colorValue = formatValue(row[colorField] ?? null, lineChart.precision, lineChart.datetime);
                const rowKey = (yFields.length === 1 ? colorValue : `${yField}, ${colorValue}`);
                colorValueSet.add(rowKey);
                const xRow = row[xField] ?? null;
                const yRow = row[yField] ?? null;
                if (xRow !== null && yRow !== null) {
                    if (!(rowKey in pointsMap)) {
                        pointsMap[rowKey] = [];
                    }
                    pointsMap[rowKey].push([xRow, yRow]);
                    xMin = (xMin === null ? xRow : xMin);
                    yMin = (yMin === null ? yRow : (yRow < yMin ? yRow : yMin));
                    xMax = xRow;
                    yMax = (yMax === null ? yRow : (yRow > yMax ? yRow : yMax));
                }
            }
        }

        // Add the points
        let colorValues;
        if (colorOrder !== null) {
            colorValues = Array.from(colorValueSet.values()).sort((cv1, cv2) => {
                const ix1 = colorOrder.indexOf(cv1);
                const ix2 = colorOrder.indexOf(cv2);
                if (ix1 !== -1 && ix2 !== -1) {
                    return ix1 < ix2 ? -1 : 1;
                } else if (ix1 === -1 && ix2 === -1) {
                    return cv1 < cv2 ? -1 : 1;
                }
                return ix1 !== -1 ? -1 : 1;
            });
        } else {
            colorValues = Array.from(colorValueSet.values()).sort();
        }
        const colorValueCount = colorValues.length;
        for (let ixColorValue = 0; ixColorValue < colorValueCount; ixColorValue += 1) {
            const colorValue = colorValues[ixColorValue];
            const color = categoricalColors[ixColorValue % categoricalColors.length];
            const points = pointsMap[colorValue];
            linePoints.push({'label': colorValue, color, points});
        }
    } else {
        // Create a line for each y-field
        const fieldCount = yFields.length;
        for (let ixField = 0; ixField < fieldCount; ixField += 1) {
            const yField = yFields[ixField];
            const color = categoricalColors[ixField % categoricalColors.length];
            const points = [];
            linePoints.push({'label': yField, color, points});

            // Add the points
            for (const row of data) {
                const xRow = row[xField] ?? null;
                const yRow = row[yField] ?? null;
                if (xRow !== null && yRow !== null) {
                    points.push([xRow, yRow]);
                    xMin = (xMin === null ? xRow : (xRow < xMin ? xRow : xMin));
                    yMin = (yMin === null ? yRow : (yRow < yMin ? yRow : yMin));
                    xMax = xRow;
                    yMax = (yMax === null ? yRow : (yRow > yMax ? yRow : yMax));
                }
            }
        }
    }
    const linePointsReversed = linePoints.slice().reverse();

    // No data?
    if (xMin === null) {
        throw new Error('No data');
    }

    // Compute the chart title, width, and height
    const chartTitle = lineChart.title ?? null;
    const chartWidth = lineChart.width ?? defaultWidth;
    const chartHeight = lineChart.height ?? defaultHeight;

    // Compute Y-axis tick values
    const yAxisTicks = [];
    const yTickCount = ('yTicks' in lineChart && 'count' in lineChart.yTicks ? lineChart.yTicks.count : defaultYAxisTickCount);
    const yTickSkip = ('yTicks' in lineChart && 'skip' in lineChart.yTicks ? lineChart.yTicks.skip + 1 : 1);
    const yTickStart = ('yTicks' in lineChart && 'start' in lineChart.yTicks ? lineChart.yTicks.start : yMin);
    const yTickEnd = ('yTicks' in lineChart && 'end' in lineChart.yTicks ? lineChart.yTicks.end : yMax);
    for (let ixTick = 0; ixTick < yTickCount; ixTick++) {
        const yTickParam = yTickCount === 1 ? 0 : ixTick / (yTickCount - 1);
        const yTickValue = parameterValue(yTickParam, yTickStart, yTickEnd);
        yAxisTicks.push([yTickValue, (ixTick % yTickSkip) !== 0 ? '' : formatValue(yTickValue, lineChart.precision, lineChart.datetime)]);
        yMin = (yTickValue < yMin ? yTickValue : yMin);
        yMax = (yTickValue > yMax ? yTickValue : yMax);
    }

    // Compute X-axis tick values
    const xAxisTicks = [];
    const xTickCount = ('xTicks' in lineChart && 'count' in lineChart.xTicks ? lineChart.xTicks.count : defaultXAxisTickCount);
    const xTickSkip = ('xTicks' in lineChart && 'skip' in lineChart.xTicks ? lineChart.xTicks.skip + 1 : 1);
    const xTickStart = ('xTicks' in lineChart && 'start' in lineChart.xTicks ? lineChart.xTicks.start : xMin);
    const xTickEnd = ('xTicks' in lineChart && 'end' in lineChart.xTicks ? lineChart.xTicks.end : xMax);
    for (let ixTick = 0; ixTick < xTickCount; ixTick++) {
        const xTickParam = xTickCount === 1 ? 0 : ixTick / (xTickCount - 1);
        const xTickValue = parameterValue(xTickParam, xTickStart, xTickEnd);
        xAxisTicks.push([xTickValue, (ixTick % xTickSkip) !== 0 ? '' : formatValue(xTickValue, lineChart.precision, lineChart.datetime)]);
        xMin = (xTickValue < xMin ? xTickValue : xMin);
        xMax = (xTickValue > xMax ? xTickValue : xMax);
    }

    // Compute Y-axis annotations
    const yAxisAnnotations = [];
    if ('yLines' in lineChart) {
        for (const annotation of lineChart.yLines) {
            const yAnnotationValue = annotation.value;
            yAxisAnnotations.push([
                yAnnotationValue,
                annotation.label ?? formatValue(yAnnotationValue, lineChart.precision, lineChart.datetime)
            ]);
            yMin = (yAnnotationValue < yMin ? yAnnotationValue : yMin);
            yMax = (yAnnotationValue > yMax ? yAnnotationValue : yMax);
        }
    }

    // Compute X-axis annotations
    const xAxisAnnotations = [];
    if ('xLines' in lineChart) {
        for (const annotation of lineChart.xLines) {
            const xAnnotationValue = annotation.value;
            xAxisAnnotations.push([
                xAnnotationValue,
                annotation.label ?? formatValue(xAnnotationValue, lineChart.precision, lineChart.datetime)
            ]);
            xMin = (xAnnotationValue < xMin ? xAnnotationValue : xMin);
            xMax = (xAnnotationValue > xMax ? xAnnotationValue : xMax);
        }
    }

    // Chart title calculations
    const chartBorderSize = chartFontSize;
    const chartTitleFontSize = 1.1 * chartFontSize;
    const chartTitleHeight = (chartTitle !== null ? 1.5 * chartTitleFontSize : 0);

    // Y-axis calculations
    const axisTitleFontSize = 1 * chartFontSize;
    const axisLabelFontSize = chartFontSize;
    const yAxisTitle = (yFields.length === 1 ? yFields[0] : null);
    const yAxisTitleWidth = (yAxisTitle !== null ? 1.8 * axisTitleFontSize : 0);
    const yAxisLabelWidth = yAxisTicks.reduce((labelMax, [, label]) => {
        const labelWidth = label.length * chartFontWidthRatio * axisLabelFontSize;
        return labelWidth > labelMax ? labelWidth : labelMax;
    }, 0);
    const yAxisTickGap = 0.75 * axisTickLength;
    const yAxisX = Math.min(
        chartBorderSize + yAxisTitleWidth + (yAxisTicks.length === 0 ? 0 : yAxisLabelWidth + yAxisTickGap + axisTickLength),
        0.4 * chartWidth
    );

    // X-axis calculations
    const xAxisTitleHeight = 1.8 * axisTitleFontSize;
    const xAxisTickGap = 0.75 * axisTickLength;
    const xAxisY = chartHeight - chartBorderSize - xAxisTitleHeight -
        (xAxisTicks.length === 0 ? 0 : axisLabelFontSize - xAxisTickGap + axisTickLength);

    // Y-axis annotation calculations
    const annotationLabelFontSize = axisLabelFontSize;
    const annotationLabelMargin = 0.25 * annotationLabelFontSize;
    const annotationLabelHeight = annotationLabelFontSize + 2 * annotationLabelMargin;
    const yAnnotationLabelOffsetX = 0.2 * annotationLabelFontSize;
    const yAnnotationLabelOffsetY = 0.1 * annotationLabelFontSize;

    // Y-axis annotation calculations
    const xAnnotationLabelOffsetX = 0.2 * annotationLabelFontSize;
    const xAnnotationLabelOffsetY = 0.1 * annotationLabelFontSize;

    // Color legend calculations
    const colorLegendFontSize = chartFontSize;
    const colorLegendGap = 0.5 * colorLegendFontSize;
    const colorLegendLabelHeight = colorLegendFontSize;
    const colorLegendLabelGap = 0.35 * colorLegendLabelHeight;
    const colorLegendSampleWidth = 1.35 * colorLegendLabelHeight;
    const colorLegendLabelWidth = linePoints.reduce((labelMax, {label}) => {
        const labelWidth = label.length * chartFontWidthRatio * colorLegendFontSize;
        return labelWidth > labelMax ? labelWidth : labelMax;
    }, 0);
    const colorLegendX = yFields.length === 1 && colorField === null ? null : Math.max(
        chartWidth - chartBorderSize - colorLegendLabelWidth - colorLegendSampleWidth,
        0.6 * chartWidth
    );

    // Chart area calculations
    const chartTop = chartBorderSize + chartTitleHeight + 0.5 * chartLineWidth;
    const chartLeft = yAxisX + 0.5 * axisLineWidth + 0.5 * chartLineWidth;
    const chartBottom = xAxisY - 0.5 * axisLineWidth - 0.5 * chartLineWidth;
    const chartRight = (colorLegendX !== null ? colorLegendX - colorLegendGap : chartWidth - chartBorderSize);

    // Axis label limits
    const xAxisLabelLeft = chartLeft + 0.5 * axisLabelFontSize;
    const xAxisLabelRight = chartRight - 0.5 * axisLabelFontSize;
    const yAxisLabelTop = chartTop + 0.5 * axisLabelFontSize;
    const yAxisLabelBottom = chartBottom - 0.5 * axisLabelFontSize;

    // Helper functions to compute chart coordindate points
    const chartPointX = (xCoord) => parameterValue(valueParameter(xCoord, xMin, xMax), chartLeft, chartRight);
    const chartPointY = (yCoord) => parameterValue(valueParameter(yCoord, yMin, yMax), chartBottom, chartTop);
    const svgValue = (value) => value.toFixed(svgPrecision);
    const chartPathPoint = ([xCoord, yCoord], ixPoint, points) => {
        const xPoint = chartPointX(xCoord);
        const yPoint = chartPointY(yCoord);
        if (points.length === 1) {
            return `M ${svgValue(xPoint - 0.5 * chartLineWidth)} ${svgValue(yPoint)} ` +
                `L ${svgValue(xPoint + 0.5 * chartLineWidth)} ${svgValue(yPoint)}`;
        }
        return `${ixPoint === 0 ? 'M' : 'L'} ${svgValue(xPoint)} ${svgValue(yPoint)}`;
    };

    // Render the chart
    return {
        'svg': 'svg',
        'attr': {
            'width': chartWidth,
            'height': chartHeight
        },
        'elem': [
            // Background
            {
                'svg': 'rect',
                'attr': {
                    'width': chartWidth,
                    'height': chartHeight,
                    'fill': chartBackgroundColor
                }
            },

            // Chart title
            chartTitle === null ? null : {
                'svg': 'text',
                'attr': {
                    'font-family': chartFontFamily,
                    'font-size': `${svgValue(chartTitleFontSize)}px`,
                    'fill': axisColor,
                    'style': 'font-weight: bold',
                    'x': svgValue(0.5 * (chartLeft + chartRight)),
                    'y': svgValue(chartBorderSize),
                    'text-anchor': 'middle',
                    'dominant-baseline': 'hanging'
                },
                'elem': {'text': chartTitle}
            },

            // Y-Axis title
            yAxisTitle === null ? null : {
                'svg': 'text',
                'attr': {
                    'font-family': chartFontFamily,
                    'font-size': `${svgValue(axisTitleFontSize)}px`,
                    'fill': axisColor,
                    'style': 'font-weight: bold',
                    'x': svgValue(chartBorderSize),
                    'y': svgValue(0.5 * (chartTop + chartBottom)),
                    'transform': `rotate(-90 ${svgValue(chartBorderSize)}, ${svgValue(0.5 * (chartTop + chartBottom))})`,
                    'text-anchor': 'middle',
                    'dominant-baseline': 'hanging'
                },
                'elem': {'text': yAxisTitle}
            },

            // Y-axis ticks
            yAxisTicks.map(([yCoord, yLabel]) => {
                const yPoint = chartPointY(yCoord);
                const hasLabel = yLabel !== '';
                const hasLine = !hasLabel || (yPoint > yAxisLabelTop && yPoint < yAxisLabelBottom);
                return [
                    !hasLabel ? null : {
                        'svg': 'path',
                        'attr': {
                            'stroke': axisColor,
                            'stroke-width': svgValue(axisTickWidth),
                            'fill': 'none',
                            'd': `M ${svgValue(yAxisX)} ${svgValue(yPoint)} H ${svgValue(yAxisX - axisTickLength)}`
                        }
                    },
                    !hasLine ? null : {
                        'svg': 'path',
                        'attr': {
                            'stroke': axisTickLineColor,
                            'stroke-width': svgValue(axisTickWidth),
                            'fill': 'none',
                            'd': `M ${svgValue(yAxisX)} ${svgValue(yPoint)} H ${svgValue(chartRight)}`
                        }
                    }
                ];
            }),

            // Y-axis labels
            yAxisTicks.map(([yCoord, yLabel]) => {
                const yPoint = chartPointY(yCoord);
                const hasLabel = yLabel !== '';
                return !hasLabel ? null : {
                    'svg': 'text',
                    'attr': {
                        'font-family': chartFontFamily,
                        'font-size': `${svgValue(axisLabelFontSize)}px`,
                        'fill': axisColor,
                        'x': svgValue(yAxisX - axisTickLength - yAxisTickGap),
                        'y': svgValue(yPoint),
                        'text-anchor': 'end',
                        'dominant-baseline': (yPoint > yAxisLabelBottom ? 'auto' : (yPoint < yAxisLabelTop ? 'hanging' : 'middle'))
                    },
                    'elem': {'text': yLabel}
                };
            }),

            // X-Axis title
            {
                'svg': 'text',
                'attr': {
                    'font-family': chartFontFamily,
                    'font-size': `${svgValue(axisTitleFontSize)}px`,
                    'fill': axisColor,
                    'style': 'font-weight: bold',
                    'x': svgValue(0.5 * (chartLeft + chartRight)),
                    'y': svgValue(chartHeight - chartBorderSize),
                    'text-anchor': 'middle',
                    'dominant-baseline': 'auto'
                },
                'elem': {'text': xField}
            },

            // X-axis ticks
            xAxisTicks.map(([xCoord, xLabel]) => {
                const xPoint = chartPointX(xCoord);
                const hasLabel = xLabel !== '';
                const hasLine = !hasLabel || (xPoint > xAxisLabelLeft && xPoint < xAxisLabelRight);
                return [
                    !hasLabel ? null : {
                        'svg': 'path',
                        'attr': {
                            'stroke': axisColor,
                            'stroke-width': svgValue(axisTickWidth),
                            'fill': 'none',
                            'd': `M ${svgValue(xPoint)} ${svgValue(xAxisY)} V ${svgValue(xAxisY + axisTickLength)}`
                        }
                    },
                    !hasLine ? null : {
                        'svg': 'path',
                        'attr': {
                            'stroke': axisTickLineColor,
                            'stroke-width': svgValue(axisTickWidth),
                            'fill': 'none',
                            'd': `M ${svgValue(xPoint)} ${svgValue(xAxisY)} V ${svgValue(chartTop)}`
                        }
                    }
                ];
            }),

            // X-axis labels
            xAxisTicks.map(([xCoord, xLabel]) => {
                const xPoint = chartPointX(xCoord);
                const hasLabel = xLabel !== '';
                return !hasLabel ? null : {
                    'svg': 'text',
                    'attr': {
                        'font-family': chartFontFamily,
                        'font-size': `${svgValue(axisLabelFontSize)}px`,
                        'fill': axisColor,
                        'x': svgValue(xPoint),
                        'y': svgValue(xAxisY + axisTickLength + xAxisTickGap),
                        'text-anchor': (xPoint < xAxisLabelLeft ? 'start' : (xPoint > xAxisLabelRight ? 'end' : 'middle')),
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {'text': xLabel}
                };
            }),

            // Axis lines
            {
                'svg': 'path',
                'attr': {
                    'stroke': axisColor,
                    'stroke-width': svgValue(axisLineWidth),
                    'fill': 'none',
                    'd': `M ${svgValue(yAxisX)} ${svgValue(chartTop - 0.5 * axisTickWidth)} ` +
                        `V ${svgValue(xAxisY)} H ${svgValue(chartRight + 0.5 * axisTickWidth)}`
                }
            },

            // Lines
            linePointsReversed.map(({color, points}) => ({
                'svg': 'path',
                'attr': {
                    'stroke': color,
                    'stroke-width': svgValue(chartLineWidth),
                    'fill': 'none',
                    'd': points.map(chartPathPoint).join(' ')
                }
            })),

            // Y-axis annotations
            yAxisAnnotations.map(([yCoord, yLabel]) => {
                const yPoint = chartPointY(yCoord);
                const isUnder = yPoint < 0.5 * (chartTop + chartBottom);
                const labelWidth = 2 * annotationLabelMargin + yLabel.length * chartFontWidthRatio * annotationLabelFontSize;
                const labelY = isUnder
                    ? yPoint + annotationLineWidth + yAnnotationLabelOffsetY
                    : yPoint - annotationLineWidth - yAnnotationLabelOffsetY - annotationLabelHeight;
                return [
                    yLabel === '' ? null : {
                        'svg': 'rect',
                        'attr': {
                            'x': svgValue(chartLeft + yAnnotationLabelOffsetX),
                            'y': svgValue(labelY),
                            'width': svgValue(labelWidth),
                            'height': svgValue(annotationLabelHeight),
                            'fill': annotationBackgroundColor
                        }
                    },
                    yLabel === '' ? null : {
                        'svg': 'text',
                        'attr': {
                            'font-family': chartFontFamily,
                            'font-size': `${svgValue(annotationLabelFontSize)}px`,
                            'fill': annotationTextColor,
                            'x': svgValue(chartLeft + yAnnotationLabelOffsetX + annotationLabelMargin),
                            'y': svgValue(labelY + annotationLabelMargin + 0.5 * annotationLabelFontSize),
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {'text': yLabel}
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': annotationLineColor,
                            'stroke-width': svgValue(annotationLineWidth),
                            'fill': 'none',
                            'd': `M ${svgValue(yAxisX)} ${svgValue(yPoint)} H ${svgValue(chartRight)}`
                        }
                    }
                ];
            }),

            // X-axis annotations
            xAxisAnnotations.map(([xCoord, xLabel]) => {
                const xPoint = chartPointX(xCoord);
                const isLeft = xPoint > 0.5 * (chartLeft + chartRight);
                const labelWidth = 2 * annotationLabelMargin + xLabel.length * chartFontWidthRatio * annotationLabelFontSize;
                const labelY = chartBottom - xAnnotationLabelOffsetY - annotationLabelHeight;
                return [
                    xLabel === '' ? null : {
                        'svg': 'rect',
                        'attr': {
                            'x': svgValue(isLeft
                                ? xPoint - 0.5 * annotationLineWidth - xAnnotationLabelOffsetX - labelWidth
                                : xPoint + 0.5 * annotationLineWidth + xAnnotationLabelOffsetX),
                            'y': svgValue(labelY),
                            'width': svgValue(labelWidth),
                            'height': svgValue(annotationLabelHeight),
                            'fill': annotationBackgroundColor
                        }
                    },
                    xLabel === '' ? null : {
                        'svg': 'text',
                        'attr': {
                            'font-family': chartFontFamily,
                            'font-size': `${svgValue(annotationLabelFontSize)}px`,
                            'fill': annotationTextColor,
                            'x': svgValue(isLeft
                                ? xPoint - 0.5 * annotationLineWidth - xAnnotationLabelOffsetX - annotationLabelMargin
                                : xPoint + 0.5 * annotationLineWidth + xAnnotationLabelOffsetX + annotationLabelMargin),
                            'y': svgValue(labelY + annotationLabelMargin + 0.5 * annotationLabelFontSize),
                            'text-anchor': (isLeft ? 'end' : 'start'),
                            'dominant-baseline': 'middle'
                        },
                        'elem': {'text': xLabel}
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': annotationLineColor,
                            'stroke-width': svgValue(annotationLineWidth),
                            'fill': 'none',
                            'd': `M ${svgValue(xPoint)} ${svgValue(xAxisY)} V ${svgValue(chartTop)}`
                        }
                    }
                ];
            }),

            // Color legend
            colorLegendX === null ? null : linePoints.map(({label, color}, ix) => [
                {
                    'svg': 'rect',
                    'attr': {
                        'x': svgValue(colorLegendX),
                        'y': svgValue(chartTop + ix * (colorLegendLabelHeight + colorLegendLabelGap)),
                        'width': svgValue(colorLegendLabelHeight),
                        'height': svgValue(colorLegendLabelHeight),
                        'stroke': 'none',
                        'fill': color
                    }
                },
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': chartFontFamily,
                        'font-size': `${svgValue(colorLegendFontSize)}px`,
                        'fill': axisColor,
                        'x': svgValue(colorLegendX + colorLegendSampleWidth),
                        'y': svgValue(chartTop + ix * (colorLegendLabelHeight + colorLegendLabelGap) + 0.5 * colorLegendLabelHeight),
                        'text-anchor': 'start',
                        'dominant-baseline': 'middle'
                    },
                    'elem': {'text': label}
                }
            ])
        ]
    };
}
