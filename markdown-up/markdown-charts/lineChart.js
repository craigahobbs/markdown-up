// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

import {loadChartData} from './data.js';


// Line chart defaults
const defaultWidth = 640;
const defaultHeight = 320;
const defaultPrecision = 2;
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
const chartLineWidth = 3;


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


// Helper function to format labels
function formatValue(value, precision) {
    if (value instanceof Date) {
        return value.toISOString().replace(rDateCleanup, '');
    } else if (typeof value === 'number') {
        return value.toFixed(precision);
    }
    return `${value}`;
}

const rDateCleanup = /(?:(?:(?:-01)?T00:00)?:00)?\.\d\d\dZ$/;


// Helper function to compute a value's parameter
function valueParameter(value, minValue, maxValue) {
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
function parameterValue(param, minValue, maxValue) {
    if (minValue instanceof Date) {
        const minDateValue = minValue.valueOf();
        return new Date(minDateValue + param * (maxValue.valueOf() - minDateValue));
    }

    return minValue + param * (maxValue - minValue);
}


/**
 * Render a line chart
 *
 * @param {Object} lineChart - The line chart model
 * @param {Object} options.window - The web browser window object
 * @param {string} [options.fontSize] - Optional font size in points
 * @param {string} [options.url] - Optional markdown file URL
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
                throw new Error(`Unknown ${fieldDesc} ${JSON.stringify(field)}`);
            }
            if (types[field] === 'string') {
                throw new Error(`Invalid type ${JSON.stringify(types[field])} for ${fieldDesc} ${JSON.stringify(field)}`);
            }
        }
    }

    // Sort the rows by the X field
    data.sort((row1, row2) => {
        const x1 = row1[xField];
        const x2 = row2[xField];
        return x1 < x2 ? -1 : (x1 === x2 ? 0 : 1);
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
                const rowKey = `${rowKeyPrefix}${colorFields.map((field) => formatValue(row[field])).join(', ')}`;
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
    const chartPrecision = 'precision' in lineChart ? lineChart.precision : defaultPrecision;
    const chartFontSize = ('fontSize' in options ? options.fontSize : defaultFontSize) * pixelsPerPoint;
    const xAxisTickCount = xMin === xMax ? 1 : ('xTickCount' in lineChart ? lineChart.xTickCount : defaultXAxisTickCount);
    const yAxisTickCount = yMin === yMax ? 1 : ('yTickCount' in lineChart ? lineChart.yTickCount : defaultYAxisTickCount);

    // Compute Y-axis tick values
    const yAxisTicks = [];
    for (let ixTick = 0; ixTick < yAxisTickCount; ixTick++) {
        const yTickParam = yAxisTickCount === 1 ? 0 : ixTick / (yAxisTickCount - 1);
        const yTickValue = parameterValue(yTickParam, yMin, yMax);
        yAxisTicks.push([yTickValue, formatValue(yTickValue, chartPrecision)]);
    }

    // Compute X-axis tick values
    const xAxisTicks = [];
    for (let ixTick = 0; ixTick < xAxisTickCount; ixTick++) {
        const xTickParam = xAxisTickCount === 1 ? 0 : ixTick / (xAxisTickCount - 1);
        const xTickValue = parameterValue(xTickParam, xMin, xMax);
        xAxisTicks.push([xTickValue, formatValue(xTickValue, chartPrecision)]);
    }

    // Chart title calculations
    const chartBorderSize = chartFontSize;
    const chartTitleFontSize = 1.1 * chartFontSize;
    const chartTitle = 'title' in lineChart ? lineChart.title : null;
    const chartTitleHeight = chartTitle !== null ? 1.5 * chartTitleFontSize : 0;

    // Y-axis calculations
    const axisTitleFontSize = 1 * chartFontSize;
    const yAxisTitle = yFields.length === 1 ? yFields[0] : null;
    const yAxisTitleWidth = yAxisTitle !== null ? 1.8 * axisTitleFontSize : 0;
    const yAxisLabelWidth = yAxisTicks.reduce((labelMax, [, label]) => {
        const labelWidth = label.length * chartFontWidthRatio * chartFontSize;
        return labelWidth > labelMax ? labelWidth : labelMax;
    }, 0);
    const yAxisTickGap = 0.75 * axisTickLength;
    const yAxisX = Math.min(
        chartBorderSize + yAxisTitleWidth + (xAxisTicks.length === 0 ? 0 : yAxisLabelWidth + yAxisTickGap + axisTickLength),
        0.4 * chartWidth
    );

    // X-axis calculations
    const xAxisTitleHeight = 1.8 * axisTitleFontSize;
    const xAxisTickGap = 0.75 * axisTickLength;
    const xAxisY = chartHeight - chartBorderSize - xAxisTitleHeight -
          (yAxisTicks.length === 0 ? 0 : chartFontSize - xAxisTickGap + axisTickLength);

    // Color legend calculations
    const colorLegendGap = 0.5 * chartFontSize;
    const colorLegendLabelHeight = chartFontSize;
    const colorLegendLabelGap = 0.35 * colorLegendLabelHeight;
    const colorLegendSampleWidth = 1.35 * colorLegendLabelHeight;
    const colorLegendLabelWidth = linePoints.reduce((labelMax, {label}) => {
        const labelWidth = label.length * chartFontWidthRatio * chartFontSize;
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
            yAxisTicks.map(([yCoord], ixTick) => [
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': axisColor,
                        'stroke-width': svgValue(axisTickWidth),
                        'fill': 'none',
                        'd': `M ${svgValue(yAxisX)} ${svgValue(chartPointY(yCoord))} H ${svgValue(yAxisX - axisTickLength)}`
                    }
                },
                ixTick === 0 || ixTick === yAxisTicks.length - 1 ? null : {
                    'svg': 'path',
                    'attr': {
                        'stroke': axisTickLineColor,
                        'stroke-width': svgValue(axisTickWidth),
                        'fill': 'none',
                        'd': `M ${svgValue(yAxisX)} ${svgValue(chartPointY(yCoord))} H ${svgValue(chartRight)}`
                    }
                }
            ]),

            // Y-axis labels
            yAxisTicks.map(([yCoord, yLabel], ix) => ({
                'svg': 'text',
                'attr': {
                    'font-family': chartFontFamily,
                    'font-size': `${svgValue(chartFontSize)}px`,
                    'fill': axisColor,
                    'x': svgValue(yAxisX - axisTickLength - yAxisTickGap),
                    'y': svgValue(chartPointY(yCoord)),
                    'text-anchor': 'end',
                    'dominant-baseline': ix === 0 ? 'auto' : (ix === yAxisTickCount - 1 ? 'hanging' : 'middle')
                },
                'elem': {'text': yLabel}
            })),

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
            xAxisTicks.map(([xCoord], ixTick) => [
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': axisColor,
                        'stroke-width': svgValue(axisTickWidth),
                        'fill': 'none',
                        'd': `M ${svgValue(chartPointX(xCoord))} ${svgValue(xAxisY)} V ${svgValue(xAxisY + axisTickLength)}`
                    }
                },
                ixTick === 0 || ixTick === xAxisTicks.length - 1 ? null : {
                    'svg': 'path',
                    'attr': {
                        'stroke': axisTickLineColor,
                        'stroke-width': svgValue(axisTickWidth),
                        'fill': 'none',
                        'd': `M ${svgValue(chartPointX(xCoord))} ${svgValue(xAxisY)} V ${svgValue(chartTop)}`
                    }
                }
            ]),

            // X-axis labels
            xAxisTicks.map(([xCoord, xLabel], ix) => ({
                'svg': 'text',
                'attr': {
                    'font-family': chartFontFamily,
                    'font-size': `${svgValue(chartFontSize)}px`,
                    'fill': axisColor,
                    'x': svgValue(chartPointX(xCoord)),
                    'y': svgValue(xAxisY + axisTickLength + xAxisTickGap),
                    'text-anchor': ix === 0 ? 'start' : (ix === xAxisTickCount - 1 ? 'end' : 'middle'),
                    'dominant-baseline': 'hanging'
                },
                'elem': {'text': xLabel}
            })),

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
                        'font-size': `${svgValue(chartFontSize)}px`,
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
