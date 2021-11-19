// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/lineChart */

import {categoricalColors, compareValues, formatValue, formatVariables, getFieldValue, parameterValue, valueParameter} from './util.js';
import {loadChartData} from './data.js';


// Line chart defaults
const defaultWidth = 640;
const defaultHeight = 320;
const defaultXAxisTickCount = 3;
const defaultYAxisTickCount = 3;
const defaultFontSize = 12;


// Line chart constants (all numbers in pixels)
const pixelsPerPoint = 4 / 3;
const svgPrecision = 3;
const chartFontFamily = 'Arial, Helvetica, sans-serif';
const chartFontWidthRatio = 0.6;
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
 * Render a line chart
 *
 * @param {Object} lineChart - The line chart model
 * @param {module:lib/util~ChartOptions} [options={}] - Chart options object
 * @returns {Object} The line chart element model
 */
export async function lineChartElements(lineChart, options = {}) {
    // Load the chart data
    const {data, types} = (await loadChartData(lineChart, options));

    // Validate X and Y field types
    const {xField, yFields, colorFields = null} = lineChart;
    for (const [fieldDesc, fields] of [['X-field', [xField]], ['Y-field', yFields]]) {
        for (const field of fields) {
            if (!(field in types)) {
                throw new Error(`Unknown ${fieldDesc} "${field}"`);
            }
            if (types[field] === 'string') {
                throw new Error(`Invalid type "${types[field]}" for ${fieldDesc} "${field}"`);
            }
        }
    }
    const xFieldType = types[xField];
    const yFieldType = types[yFields[0]];
    for (const field of yFields) {
        if (types[field] !== yFieldType) {
            throw new Error(`Invalid type "${types[field]}" for Y-field "${field}"`);
        }
    }

    // Sort the rows by the X field
    data.sort((row1, row2) => {
        const x1 = xField in row1 ? row1[xField] : null;
        const x2 = xField in row2 ? row2[xField] : null;
        return compareValues(x1, x2);
    });

    // Generate the line points - [(label, color, points), ...]
    const linePoints = [];
    let xMin = null;
    let yMin = null;
    let xMax = null;
    let yMax = null;
    if (colorFields !== null) {
        // Determine the set of color encoding values
        const colorValueSet = new Set();
        const pointsMap = {};
        for (const row of data) {
            for (const yField of yFields) {
                const rowKeyPrefix = yFields.length === 1 ? '' : `${yField}, `;
                const rowKey = `${rowKeyPrefix}${colorFields.map((field) => formatValue(row[field], lineChart)).join(', ')}`;
                colorValueSet.add(rowKey);
                const xRow = xField in row ? row[xField] : null;
                const yRow = yField in row ? row[yField] : null;
                if (xRow !== null && yRow !== null) {
                    if (rowKey in pointsMap) {
                        pointsMap[rowKey].push([xRow, yRow]);
                    } else {
                        pointsMap[rowKey] = [[xRow, yRow]];
                    }
                }
                xMin = xMin === null ? xRow : xRow < xMin ? xRow : xMin;
                yMin = yMin === null ? yRow : yRow < yMin ? yRow : yMin;
                xMax = xMax === null ? xRow : xRow > xMax ? xRow : xMax;
                yMax = yMax === null ? yRow : yRow > yMax ? yRow : yMax;
            }
        }

        // Add the points
        const colorValues = Array.from(colorValueSet.values()).sort();
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
                if (xField in row && yField in row) {
                    const xRow = xField in row ? row[xField] : null;
                    const yRow = yField in row ? row[yField] : null;
                    if (xRow !== null && yRow !== null) {
                        points.push([xRow, yRow]);
                        xMin = xMin === null ? xRow : xRow < xMin ? xRow : xMin;
                        yMin = yMin === null ? yRow : yRow < yMin ? yRow : yMin;
                        xMax = xMax === null ? xRow : xRow > xMax ? xRow : xMax;
                        yMax = yMax === null ? yRow : yRow > yMax ? yRow : yMax;
                    }
                }
            }
        }
    }

    // No data?
    if (xMin === null) {
        throw new Error('No data');
    }

    // Override-able properties
    const chartWidth = 'width' in lineChart ? lineChart.width : defaultWidth;
    const chartHeight = 'height' in lineChart ? lineChart.height : defaultHeight;
    const chartFontSize = ('fontSize' in options ? options.fontSize : defaultFontSize) * pixelsPerPoint;

    // Compute the variables
    const variables = {
        ...('variables' in lineChart ? lineChart.variables : {}),
        ...('variables' in options ? options.variables : {})
    };

    // Compute Y-axis tick values
    const yAxisTicks = [];
    const yTickCount = 'yTicks' in lineChart && 'count' in lineChart.yTicks ? lineChart.yTicks.count : defaultYAxisTickCount;
    const yTickSkip = 'yTicks' in lineChart && 'skip' in lineChart.yTicks ? lineChart.yTicks.skip + 1 : 1;
    const yTickStart = 'yTicks' in lineChart && 'start' in lineChart.yTicks
        ? getFieldValue(variables, lineChart.yTicks.start, yFieldType, 'Y-axis start value')
        : yMin;
    const yTickEnd = 'yTicks' in lineChart && 'end' in lineChart.yTicks
        ? getFieldValue(variables, lineChart.yTicks.end, yFieldType, 'Y-axis end value')
        : yMax;
    for (let ixTick = 0; ixTick < yTickCount; ixTick++) {
        const yTickParam = yTickCount === 1 ? 0 : ixTick / (yTickCount - 1);
        const yTickValue = parameterValue(yTickParam, yTickStart, yTickEnd);
        yAxisTicks.push([yTickValue, (ixTick % yTickSkip) !== 0 ? '' : formatValue(yTickValue, lineChart)]);
        yMin = yTickValue < yMin ? yTickValue : yMin;
        yMax = yTickValue > yMax ? yTickValue : yMax;
    }

    // Compute X-axis tick values
    const xAxisTicks = [];
    const xTickCount = 'xTicks' in lineChart && 'count' in lineChart.xTicks ? lineChart.xTicks.count : defaultXAxisTickCount;
    const xTickSkip = 'xTicks' in lineChart && 'skip' in lineChart.xTicks ? lineChart.xTicks.skip + 1 : 1;
    const xTickStart = 'xTicks' in lineChart && 'start' in lineChart.xTicks
        ? getFieldValue(variables, lineChart.xTicks.start, xFieldType, 'X-axis start value')
        : xMin;
    const xTickEnd = 'xTicks' in lineChart && 'end' in lineChart.xTicks
        ? getFieldValue(variables, lineChart.xTicks.end, xFieldType, 'X-axis end value')
        : xMax;
    for (let ixTick = 0; ixTick < xTickCount; ixTick++) {
        const xTickParam = xTickCount === 1 ? 0 : ixTick / (xTickCount - 1);
        const xTickValue = parameterValue(xTickParam, xTickStart, xTickEnd);
        xAxisTicks.push([xTickValue, (ixTick % xTickSkip) !== 0 ? '' : formatValue(xTickValue, lineChart)]);
        xMin = xTickValue < xMin ? xTickValue : xMin;
        xMax = xTickValue > xMax ? xTickValue : xMax;
    }

    // Compute Y-axis annotations
    const yAxisAnnotations = [];
    if ('yAnnotations' in lineChart) {
        for (const annotation of lineChart.yAnnotations) {
            const yAnnotationValue = getFieldValue(variables, annotation.value, yFieldType, 'Y-axis annotation value');
            yAxisAnnotations.push([yAnnotationValue, 'label' in annotation ? annotation.label : formatValue(yAnnotationValue, lineChart)]);
            yMin = yAnnotationValue < yMin ? yAnnotationValue : yMin;
            yMax = yAnnotationValue > yMax ? yAnnotationValue : yMax;
        }
    }

    // Compute X-axis annotations
    const xAxisAnnotations = [];
    if ('xAnnotations' in lineChart) {
        for (const annotation of lineChart.xAnnotations) {
            const xAnnotationValue = getFieldValue(variables, annotation.value, xFieldType, 'X-axis annotation value');
            xAxisAnnotations.push([xAnnotationValue, 'label' in annotation ? annotation.label : formatValue(xAnnotationValue, lineChart)]);
            xMin = xAnnotationValue < xMin ? xAnnotationValue : xMin;
            xMax = xAnnotationValue > xMax ? xAnnotationValue : xMax;
        }
    }

    // Chart title calculations
    const chartBorderSize = chartFontSize;
    const chartTitleFontSize = 1.1 * chartFontSize;
    const chartTitle = 'title' in lineChart ? lineChart.title : null;
    const chartTitleHeight = chartTitle !== null ? 1.5 * chartTitleFontSize : 0;

    // Y-axis calculations
    const axisTitleFontSize = 1 * chartFontSize;
    const axisLabelFontSize = chartFontSize;
    const yAxisTitle = yFields.length === 1 ? yFields[0] : null;
    const yAxisTitleWidth = yAxisTitle !== null ? 1.8 * axisTitleFontSize : 0;
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
    const annotationLabelHeight = 1.5 * annotationLabelFontSize;
    const annotationLabelMargin = 0.25 * annotationLabelFontSize;
    const annotationLabelWidthRatio = 1.2;
    const yAnnotationLabelOffsetX = 0.1 * annotationLabelFontSize;
    const yAnnotationLabelOffsetY = 0.2 * annotationLabelFontSize;

    // Y-axis annotation calculations
    const xAnnotationLabelOffsetX = 0.4 * annotationLabelFontSize;
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
    const colorLegendX = yFields.length === 1 && !('colorFields' in lineChart) ? null : Math.max(
        chartWidth - chartBorderSize - colorLegendLabelWidth - colorLegendSampleWidth,
        0.6 * chartWidth
    );

    // Chart area calculations
    const chartTop = chartBorderSize + chartTitleHeight + 0.5 * chartLineWidth;
    const chartLeft = yAxisX + 0.5 * axisLineWidth + 0.5 * chartLineWidth;
    const chartBottom = xAxisY - 0.5 * axisLineWidth - 0.5 * chartLineWidth;
    const chartRight = colorLegendX !== null ? colorLegendX - colorLegendGap : chartWidth - chartBorderSize;

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
                'elem': {'text': formatVariables(lineChart, variables, lineChart.title)}
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
                        'dominant-baseline': yPoint > yAxisLabelBottom ? 'auto' : (yPoint < yAxisLabelTop ? 'hanging' : 'middle')
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
                        'text-anchor': xPoint < xAxisLabelLeft ? 'start' : (xPoint > xAxisLabelRight ? 'end' : 'middle'),
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

            // Y-axis annotations
            yAxisAnnotations.map(([yCoord, yLabel]) => {
                const yPoint = chartPointY(yCoord);
                const isUnder = yPoint < 0.5 * (chartLeft + chartRight);
                const labelWidth = annotationLabelWidthRatio * yLabel.length * chartFontWidthRatio * annotationLabelFontSize;
                const labelY = isUnder ? yPoint + yAnnotationLabelOffsetY : yPoint - yAnnotationLabelOffsetY;
                return [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': svgValue(chartLeft + yAnnotationLabelOffsetX),
                            'y': svgValue(labelY),
                            'width': svgValue(labelWidth),
                            'height': svgValue(annotationLabelHeight),
                            'fill': annotationBackgroundColor
                        }
                    },
                    {
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
                const isRight = xPoint < 0.5 * (chartLeft + chartRight);
                const labelWidth = annotationLabelWidthRatio * xLabel.length * chartFontWidthRatio * annotationLabelFontSize;
                const labelY = xAxisY - xAnnotationLabelOffsetY - annotationLabelHeight;
                return [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': svgValue(isRight ? xPoint : xPoint - labelWidth),
                            'y': svgValue(labelY),
                            'width': svgValue(labelWidth),
                            'height': svgValue(annotationLabelHeight),
                            'fill': annotationBackgroundColor
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': chartFontFamily,
                            'font-size': `${svgValue(annotationLabelFontSize)}px`,
                            'fill': annotationTextColor,
                            'x': svgValue(isRight ? xPoint + xAnnotationLabelOffsetX : xPoint - xAnnotationLabelOffsetX),
                            'y': svgValue(labelY + annotationLabelMargin + 0.5 * annotationLabelFontSize),
                            'text-anchor': isRight ? 'start' : 'end',
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

            // Lines
            linePoints.map(({color, points}) => ({
                'svg': 'path',
                'attr': {
                    'stroke': color,
                    'stroke-width': svgValue(chartLineWidth),
                    'fill': 'none',
                    'd': points.map(chartPathPoint).join(' ')
                }
            })),

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
