// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {dataTableElements, validateDataTable} from './dataTable.js';
import {escapeMarkdownText, getMarkdownTitle, parseMarkdown} from 'markdown-model/lib/parser.js';
import {lineChartElements, validateLineChart} from './lineChart.js';
import {valueArgsModel, valueArgsValidate} from 'bare-script/lib/value.js';
import {encodeQueryString} from 'schema-markdown/lib/encode.js';
import {markdownHeaderId as markdownModelHeaderId} from 'markdown-model/lib/elements.js';
import {schemaMarkdownDoc} from 'schema-markdown-doc/lib/schemaMarkdownDoc.js';
import {validateElements} from 'element-model/lib/elementModel.js';


/* eslint-disable id-length */


// Constants
const defaultFontFamily = 'Arial, Helvetica, sans-serif';
const fontWidthRatio = 0.6;
const pixelsPerPoint = 4 / 3;
const svgPrecision = 8;


//
// Data functions
//


// $function: dataLineChart
// $group: Data
// $doc: Draw a line chart
// $arg data: The data array
// $arg lineChart: The [line chart model](model.html#var.vName='LineChart')
function dataLineChart(args, options) {
    const [data, lineChart] = valueArgsValidate(dataLineChartArgs, args);
    const {runtime} = options;

    // Render the line chart
    const elements = lineChartElements(data, validateLineChart(lineChart), options);
    runtime.setElements();
    runtime.addElements({'html': 'p', 'elem': elements});

    // Set the drawing size (the chart is now the active drawing)
    runtime.drawingWidth = elements.attr.width;
    runtime.drawingHeight = elements.attr.height;
}

const dataLineChartArgs = valueArgsModel([
    {'name': 'data', 'type': 'array'},
    {'name': 'lineChart', 'type': 'object'}
]);


// $function: dataTable
// $group: Data
// $doc: Draw a data table
// $arg data: The data array
// $arg dataTable: Optional (default is null). The [data table model](model.html#var.vName='DataTable').
function dataTable(args, options) {
    const [data, dataTableModel] = valueArgsValidate(dataTableArgs, args);
    const {runtime} = options;
    runtime.setElements();
    const dataTableValidated = (dataTableModel !== null ? validateDataTable(dataTableModel, options) : null);
    runtime.addElements(dataTableElements(data, dataTableValidated, options));
}

const dataTableArgs = valueArgsModel([
    {'name': 'data', 'type': 'array'},
    {'name': 'dataTable', 'type': 'object', 'nullable': true}
]);


//
// Document functions
//


// $function: documentFontSize
// $group: Document
// $doc: Get the document font size
// $return: The document font size, in pixels
function documentFontSize(unusedArgs, options) {
    return options.fontSize * pixelsPerPoint;
}


// $function: documentInputValue
// $group: Document
// $doc: Get an input element's value
// $arg id: The input element ID
// $return: The input element value or null if the element does not exist
function documentInputValue(args, options) {
    const [id] = valueArgsValidate(documentInputValueArgs, args);
    const element = options.window.document.getElementById(id) ?? null;
    return (element !== null ? (element.value ?? null) : null);
}

const documentInputValueArgs = valueArgsModel([
    {'name': 'id', 'type': 'string'}
]);


// $function: documentSetFocus
// $group: Document
// $doc: Set focus to an element
// $arg id: The element ID
function documentSetFocus(args, options) {
    const [id] = valueArgsValidate(documentSetFocusArgs, args);
    const {runtime} = options;
    runtime.documentFocus = id;
}

const documentSetFocusArgs = valueArgsModel([
    {'name': 'id', 'type': 'string'}
]);


// $function: documentSetReset
// $group: Document
// $doc: Set the document reset element
// $arg id: The element ID
function documentSetReset(args, options) {
    const [id] = valueArgsValidate(documentSetResetArgs, args);
    const {runtime} = options;
    runtime.documentReset = id;
}

const documentSetResetArgs = valueArgsModel([
    {'name': 'id', 'type': 'string'}
]);


// $function: documentSetTitle
// $group: Document
// $doc: Set the document title
// $arg title: The document title string
function documentSetTitle(args, options) {
    const [title] = valueArgsValidate(documentSetTitleArgs, args);
    const {runtime} = options;
    runtime.documentTitle = title;
}

const documentSetTitleArgs = valueArgsModel([
    {'name': 'title', 'type': 'string'}
]);


// $function: documentURL
// $group: Document
// $doc: Fix-up relative URLs
// $arg url: The URL
// $return: The fixed-up URL
function documentURL(args, options) {
    const [url] = valueArgsValidate(documentURLArgs, args);
    return options.urlFn(url);
}

const documentURLArgs = valueArgsModel([
    {'name': 'url', 'type': 'string'}
]);


//
// Drawing functions
//


// $function: drawArc
// $group: Drawing
// $doc: Draw an arc curve from the current point to the end point
// $arg rx: The arc ellipse's x-radius
// $arg ry: The arc ellipse's y-radius
// $arg angle: The rotation (in degrees) of the ellipse relative to the x-axis
// $arg largeArcFlag: Either large arc (1) or small arc (0)
// $arg sweepFlag: Either clockwise turning arc (1) or counterclockwise turning arc (0)
// $arg x: The x-coordinate of the end point
// $arg y: The y-coordinate of the end point
function drawArc(args, options) {
    const [rx, ry, angle, largeArcFlag, sweepFlag, x, y] = valueArgsValidate(drawArcArgs, args);
    const {runtime} = options;
    runtime.setDrawingPath();
    runtime.drawingPath.push(
        `A ${rx.toFixed(svgPrecision)} ${ry.toFixed(svgPrecision)} ${angle.toFixed(svgPrecision)} ` +
            `${largeArcFlag ? 1 : 0} ${sweepFlag ? 1 : 0} ${x.toFixed(svgPrecision)} ${y.toFixed(svgPrecision)}`
    );
}

const drawArcArgs = valueArgsModel([
    {'name': 'rx', 'type': 'number'},
    {'name': 'ry', 'type': 'number'},
    {'name': 'angle', 'type': 'number'},
    {'name': 'largeArcFlag', 'type': 'boolean'},
    {'name': 'sweepFlag', 'type': 'boolean'},
    {'name': 'x', 'type': 'number'},
    {'name': 'y', 'type': 'number'},
]);


// $function: drawCircle
// $group: Drawing
// $doc: Draw a circle
// $arg cx: The x-coordinate of the center of the circle
// $arg cy: The y-coordinate of the center of the circle
// $arg r: The radius of the circle
function drawCircle(args, options) {
    const [cx, cy, r] = valueArgsValidate(drawCircleArgs, args);
    const {runtime} = options;
    const svg = runtime.setDrawing();
    svg.elem.push({
        'svg': 'circle',
        'attr': {
            'fill': runtime.drawingPathFill,
            'stroke': runtime.drawingPathStroke,
            'stroke-width': runtime.drawingPathStrokeWidth.toFixed(svgPrecision),
            'stroke-dasharray': runtime.drawingPathStrokeDashArray,
            'cx': cx,
            'cy': cy,
            'r': r
        }
    });
}

const drawCircleArgs = valueArgsModel([
    {'name': 'cx', 'type': 'number'},
    {'name': 'cy', 'type': 'number'},
    {'name': 'r', 'type': 'number'}
]);


// $function: drawClose
// $group: Drawing
// $doc: Close the current drawing path
function drawClose(unusedArgs, options) {
    const {runtime} = options;
    runtime.setDrawingPath();
    runtime.drawingPath.push('Z');
}


// $function: drawEllipse
// $group: Drawing
// $doc: Draw an ellipse
// $arg cx: The x-coordinate of the center of the ellipse
// $arg cy: The y-coordinate of the center of the ellipse
// $arg rx: The x-radius of the ellipse
// $arg ry: The y-radius of the ellipse
function drawEllipse(args, options) {
    const [cx, cy, rx, ry] = valueArgsValidate(drawEllipseArgs, args);
    const {runtime} = options;
    const svg = runtime.setDrawing();
    svg.elem.push({
        'svg': 'ellipse',
        'attr': {
            'fill': runtime.drawingPathFill,
            'stroke': runtime.drawingPathStroke,
            'stroke-width': runtime.drawingPathStrokeWidth.toFixed(svgPrecision),
            'stroke-dasharray': runtime.drawingPathStrokeDashArray,
            'cx': cx,
            'cy': cy,
            'rx': rx,
            'ry': ry
        }
    });
}

const drawEllipseArgs = valueArgsModel([
    {'name': 'cx', 'type': 'number'},
    {'name': 'cy', 'type': 'number'},
    {'name': 'rx', 'type': 'number'},
    {'name': 'ry', 'type': 'number'}
]);


// $function: drawHLine
// $group: Drawing
// $doc: Draw a horizontal line from the current point to the end point
// $arg x: The x-coordinate of the end point
function drawHLine(args, options) {
    const [x] = valueArgsValidate(drawHLineArgs, args);
    const {runtime} = options;
    runtime.setDrawingPath();
    runtime.drawingPath.push(`H ${x.toFixed(svgPrecision)}`);
}

const drawHLineArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'}
]);


// $function: drawHeight
// $group: Drawing
// $doc: Get the current drawing's height
// $return: The current drawing's height
function drawHeight(unusedArgs, options) {
    return options.runtime.drawingHeight;
}


// $function: drawImage
// $group: Drawing
// $doc: Draw an image
// $arg x: The x-coordinate of the center of the image
// $arg y: The y-coordinate of the center of the image
// $arg width: The width of the image
// $arg height: The height of the image
// $arg href: The image resource URL
function drawImage(args, options) {
    const [x, y, width, height, href] = valueArgsValidate(drawImageArgs, args);
    const {runtime} = options;
    const svg = runtime.setDrawing();
    svg.elem.push({
        'svg': 'image',
        'attr': {
            'x': x,
            'y': y,
            'width': width,
            'height': height,
            'href': options.urlFn(href)
        }
    });
}

const drawImageArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'},
    {'name': 'y', 'type': 'number'},
    {'name': 'width', 'type': 'number'},
    {'name': 'height', 'type': 'number'},
    {'name': 'href', 'type': 'string'}
]);


// $function: drawLine
// $group: Drawing
// $doc: Draw a line from the current point to the end point
// $arg x: The x-coordinate of the end point
// $arg y: The y-coordinate of the end point
function drawLine(args, options) {
    const [x, y] = valueArgsValidate(drawLineArgs, args);
    const {runtime} = options;
    runtime.setDrawingPath();
    runtime.drawingPath.push(`L ${x.toFixed(svgPrecision)} ${y.toFixed(svgPrecision)}`);
}

const drawLineArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'},
    {'name': 'y', 'type': 'number'}
]);


// $function: drawMove
// $group: Drawing
// $doc: Move the path's drawing point
// $arg x: The x-coordinate of the new drawing point
// $arg y: The y-coordinate of the new drawing point
function drawMove(args, options) {
    const [x, y] = valueArgsValidate(drawMoveArgs, args);
    const {runtime} = options;
    runtime.setDrawingPath();
    runtime.drawingPath.push(`M ${x.toFixed(svgPrecision)} ${y.toFixed(svgPrecision)}`);
}

const drawMoveArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'},
    {'name': 'y', 'type': 'number'}
]);


// $function: drawNew
// $group: Drawing
// $doc: Create a new drawing
// $arg width: The width of the drawing
// $arg height: The height of the drawing
function drawNew(args, options) {
    const [width, height] = valueArgsValidate(drawNewArgs, args);
    const {runtime} = options;
    runtime.drawingWidth = width;
    runtime.drawingHeight = height;
    runtime.setDrawing(true);
}

const drawNewArgs = valueArgsModel([
    {'name': 'width', 'type': 'number'},
    {'name': 'height', 'type': 'number'}
]);


// $function: drawOnClick
// $group: Drawing
// $doc: Set the most recent drawing object's on-click event handler
// $arg callback: The on-click event callback function (x, y)
function drawOnClick(args, options) {
    const [callback] = valueArgsValidate(drawOnClickArgs, args);
    const {runtime} = options;
    const svg = runtime.setDrawing();
    const clickElement = (svg.elem.length === 0 ? svg : svg.elem[svg.elem.length - 1]);
    clickElement.attr.style = 'cursor: pointer;';
    clickElement.callback = (element) => {
        element.addEventListener('click', async (event) => {
            const boundingRect = event.target.ownerSVGElement.getBoundingClientRect();
            options.statementCount = 0;
            try {
                await callback([event.clientX - boundingRect.left, event.clientY - boundingRect.top], options);
            } catch ({message}) {
                if ('logFn' in options && options.debug) {
                    options.logFn(`MarkdownUp: Error executing drawOnClick callback: ${message}`);
                }
            }
            options.runtimeUpdateFn();
        });
    };
}

const drawOnClickArgs = valueArgsModel([
    {'name': 'callback', 'type': 'function'}
]);


// $function: drawPathRect
// $group: Drawing
// $doc: Draw a rectangle as a path
// $arg x: The x-coordinate of the top-left of the rectangle
// $arg y: The y-coordinate of the top-left of the rectangle
// $arg width: The width of the rectangle
// $arg height: The height of the rectangle
function drawPathRect(args, options) {
    const [x, y, width, height] = valueArgsValidate(drawPathRectArgs, args);
    const {runtime} = options;
    runtime.setDrawingPath();
    runtime.drawingPath.push(`M ${x.toFixed(svgPrecision)} ${y.toFixed(svgPrecision)}`);
    runtime.drawingPath.push(`H ${(x + width).toFixed(svgPrecision)}`);
    runtime.drawingPath.push(`V ${(y + height).toFixed(svgPrecision)}`);
    runtime.drawingPath.push(`H ${x.toFixed(svgPrecision)}`);
    runtime.drawingPath.push('Z');
}

const drawPathRectArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'},
    {'name': 'y', 'type': 'number'},
    {'name': 'width', 'type': 'number'},
    {'name': 'height', 'type': 'number'}
]);


// $function: drawRect
// $group: Drawing
// $doc: Draw a rectangle
// $arg x: The x-coordinate of the top-left of the rectangle
// $arg y: The y-coordinate of the top-left of the rectangle
// $arg width: The width of the rectangle
// $arg height: The height of the rectangle
// $arg rx: Optional (default is null). The horizontal corner radius of the rectangle.
// $arg ry: Optional (default is null). The vertical corner radius of the rectangle.
function drawRect(args, options) {
    const [x, y, width, height, rx = null, ry = null] = valueArgsValidate(drawRectArgs, args);
    const {runtime} = options;
    const svg = runtime.setDrawing();
    const element = {
        'svg': 'rect',
        'attr': {
            'fill': runtime.drawingPathFill,
            'stroke': runtime.drawingPathStroke,
            'stroke-width': runtime.drawingPathStrokeWidth.toFixed(svgPrecision),
            'stroke-dasharray': runtime.drawingPathStrokeDashArray,
            'x': x,
            'y': y,
            'width': width,
            'height': height
        }
    };
    if (rx !== null) {
        element.attr.rx = rx;
    }
    if (ry !== null) {
        element.attr.ry = ry;
    }
    svg.elem.push(element);
}

const drawRectArgs = valueArgsModel([
    {'name': 'x', 'type': 'number'},
    {'name': 'y', 'type': 'number'},
    {'name': 'width', 'type': 'number'},
    {'name': 'height', 'type': 'number'},
    {'name': 'rx', 'type': 'number', 'nullable': true},
    {'name': 'ry', 'type': 'number', 'nullable': true}
]);


// $function: drawStyle
// $group: Drawing
// $doc: Set the current drawing styles
// $arg stroke: Optional (default is 'black'). The stroke color.
// $arg strokeWidth: Optional (default is 1). The stroke width.
// $arg fill: Optional (default is 'none'). The fill color.
// $arg strokeDashArray: Optional (default is 'none'). The stroke
// $arg strokeDashArray: [dash array](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray#usage_notes).
function drawStyle(args, options) {
    const [stroke, strokeWidth, fill, strokeDashArray] = valueArgsValidate(drawStyleArgs, args);
    const {runtime} = options;
    if (stroke !== runtime.drawingPathStroke || strokeWidth !== runtime.drawingPathStrokeWidth ||
        strokeDashArray !== runtime.drawingPathStrokeDashArray || fill !== runtime.drawingPathFill
    ) {
        runtime.setDrawing();
        runtime.drawingPathStroke = stroke;
        runtime.drawingPathStrokeWidth = strokeWidth;
        runtime.drawingPathStrokeDashArray = strokeDashArray;
        runtime.drawingPathFill = fill;
    }
}

const drawStyleArgs = valueArgsModel([
    {'name': 'stroke', 'type': 'string', 'default': 'black'},
    {'name': 'strokeWidth', 'type': 'number', 'default': 1},
    {'name': 'fill', 'type': 'string', 'default': 'none'},
    {'name': 'strokeDashArray', 'type': 'string', 'default': 'none'}
]);


// $function: drawText
// $group: Drawing
// $doc: Draw text
// $arg text: The text to draw
// $arg x: The x-coordinate of the text
// $arg y: The y-coordinate of the text
// $arg textAnchor: Optional (default is 'middle'). The
// $arg textAnchor: [text anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor#usage_notes) style.
// $arg dominantBaseline: Optional (default is 'middle'). The
// $arg dominantBaseline: [dominant baseline](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/dominant-baseline#usage_notes)
// $arg dominantBaseline: style.
function drawText(args, options) {
    const [text, x, y, textAnchor, dominantBaseline] = valueArgsValidate(drawTextArgs, args);
    const {runtime} = options;
    const svg = runtime.setDrawing();
    svg.elem.push({
        'svg': 'text',
        'attr': {
            'fill': runtime.drawingFontFill,
            'font-family': runtime.drawingFontFamily,
            'font-size': runtime.drawingFontSizePx.toFixed(svgPrecision),
            'text-anchor': textAnchor,
            'dominant-baseline': dominantBaseline,
            'font-weight': (runtime.drawingFontBold ? 'bold' : 'normal'),
            'font-style': (runtime.drawingFontItalic ? 'italic' : 'normal'),
            'x': x,
            'y': y
        },
        'elem': {'text': text}
    });
}

const drawTextArgs = valueArgsModel([
    {'name': 'text', 'type': 'string'},
    {'name': 'x', 'type': 'number'},
    {'name': 'y', 'type': 'number'},
    {'name': 'textAnchor', 'type': 'string', 'default': 'middle'},
    {'name': 'dominantBaseline', 'type': 'string', 'default': 'middle'}
]);


// $function: drawTextHeight
// $group: Drawing
// $doc: Compute the text's height to fit the width
// $arg text: The text
// $arg width: The width of the text. If 0, the default font size (in pixels) is returned.
// $return: The text's height, in pixels
function drawTextHeight(args, options) {
    const [text, width] = valueArgsValidate(drawTextHeightArgs, args);
    return width > 0 ? width / (fontWidthRatio * text.length) : options.runtime.drawingFontSizePx;
}

const drawTextHeightArgs = valueArgsModel([
    {'name': 'text', 'type': 'string'},
    {'name': 'width', 'type': 'number'},
]);


// $function: drawTextStyle
// $group: Drawing
// $doc: Set the current text drawing styles
// $arg fontSizePx: Optional (default is null, the default font size). The text font size, in pixels.
// $arg textFill: Optional (default is 'black'). The text fill color.
// $arg bold: Optional (default is false). If true, text is bold.
// $arg italic: Optional (default is false). If true, text is italic.
// $arg fontFamily: Optional (default is null, the default font family). The text font family.
function drawTextStyle(args, options) {
    const [fontSizePx, textFill, bold, italic, fontFamily] = valueArgsValidate(drawTextStyleArgs, args);
    const {runtime} = options;
    runtime.drawingFontSizePx = (fontSizePx !== null ? fontSizePx : options.fontSize * pixelsPerPoint);
    runtime.drawingFontFill = textFill;
    runtime.drawingFontBold = bold;
    runtime.drawingFontItalic = italic;
    runtime.drawingFontFamily = fontFamily;
}

const drawTextStyleArgs = valueArgsModel([
    {'name': 'fontSizePx', 'type': 'number', 'nullable': true},
    {'name': 'textFill', 'type': 'string', 'default': 'black'},
    {'name': 'bold', 'type': 'boolean', 'default': false},
    {'name': 'italic', 'type': 'boolean', 'default': false},
    {'name': 'fontFamily', 'type': 'string', 'default': defaultFontFamily},
]);


// $function: drawTextWidth
// $group: Drawing
// $doc: Compute the text's width
// $arg text: The text
// $arg fontSizePx: The text font size, in pixels
// $return: The text's width, in pixels
function drawTextWidth(args) {
    const [text, fontSizePx] = valueArgsValidate(drawTextWidthArgs, args);
    return fontWidthRatio * fontSizePx * text.length;
}

const drawTextWidthArgs = valueArgsModel([
    {'name': 'text', 'type': 'string'},
    {'name': 'fontSizePx', 'type': 'number'}
]);


// $function: drawVLine
// $group: Drawing
// $doc: Draw a vertical line from the current point to the end point
// $arg y: The y-coordinate of the end point
function drawVLine(args, options) {
    const [y] = valueArgsValidate(drawVLineArgs, args);
    const {runtime} = options;
    runtime.setDrawingPath();
    runtime.drawingPath.push(`V ${y.toFixed(svgPrecision)}`);
}

const drawVLineArgs = valueArgsModel([
    {'name': 'y', 'type': 'number'}
]);


// $function: drawWidth
// $group: Drawing
// $doc: Get the current drawing's width
// $return: The current drawing's width
function drawWidth(unusedArgs, options) {
    return options.runtime.drawingWidth;
}


//
// Element Model functions
//


// $function: elementModelRender
// $group: Element Model
// $doc: Render an [element model](https://github.com/craigahobbs/element-model#readme)
// $doc:
// $doc: **Note:** Element model "callback" members are a map of event name (e.g., "click") to
// $doc: event callback function. The following events have callback arguments:
// $doc: - **keydown** - keyCode
// $doc: - **keypress** - keyCode
// $doc: - **keyup** - keyCode
// $arg element: The [element model](https://github.com/craigahobbs/element-model#readme)
function elementModelRender([elements = null], options) {
    const {runtime} = options;
    runtime.setElements();
    elementModelWrapCallbacks(elements, options);
    runtime.addElements(validateElements(elements));
}


function elementModelWrapCallbacks(elements, options) {
    // Ignore non-objects
    if (elements === null || typeof elements !== 'object') {
        return;
    }

    // Array?
    if (Array.isArray(elements)) {
        for (const childElements of elements) {
            elementModelWrapCallbacks(childElements, options);
        }
        return;
    }

    // Wrap child elements
    const elementsElem = elements.elem ?? null;
    if (elementsElem !== null) {
        elementModelWrapCallbacks(elementsElem, options);
    }

    // Element callback attribute must be map of event => callback
    if ('callback' in elements) {
        // Wrap the event handler function
        const elementEvents = elements.callback;
        if (elementEvents !== null) {
            elements.callback = (element) => {
                // On element render, add a listener for each event
                for (const [elementEvent, elementEventCallback] of Object.entries(elementEvents)) {
                    element.addEventListener(elementEvent, async (event) => {
                        // Determine the event callback args
                        const eventArgs = [];
                        if (elementEvent === 'keydown' || elementEvent === 'keypress' || elementEvent === 'keyup') {
                            eventArgs.push(event.keyCode);
                        }

                        // Call the event handler
                        options.statementCount = 0;
                        try {
                            await elementEventCallback(eventArgs, options);
                        } catch ({message}) {
                            if ('logFn' in options && options.debug) {
                                options.logFn(`MarkdownUp: Error executing elementModelRender callback: ${message}`);
                            }
                        }
                        options.runtimeUpdateFn();
                    });
                }
            };
        }
    }
}


//
// Local storage functions
//


// $function: localStorageClear
// $group: Local Storage
// $doc: Clear all keys from the browser's local storage
function localStorageClear(unusedArgs, options) {
    options.window.localStorage.clear();
}


// $function: localStorageGet
// $group: Local Storage
// $doc: Get a browser local storage key's value
// $arg key: The key string
// $return: The local storage value string or null if the key does not exist
function localStorageGet(args, options) {
    const [key] = valueArgsValidate(localStorageGetArgs, args);
    return options.window.localStorage.getItem(key);
}

const localStorageGetArgs = valueArgsModel([
    {'name': 'key', 'type': 'string'}
]);


// $function: localStorageRemove
// $group: Local Storage
// $doc: Remove a browser local storage key
// $arg key: The key string
function localStorageRemove(args, options) {
    const [key] = valueArgsValidate(localStorageRemoveArgs, args);
    return options.window.localStorage.removeItem(key);
}

const localStorageRemoveArgs = valueArgsModel([
    {'name': 'key', 'type': 'string'}
]);


// $function: localStorageSet
// $group: Local Storage
// $doc: Set a browser local storage key's value
// $arg key: The key string
// $arg value: The value string
function localStorageSet(args, options) {
    const [key, value] = valueArgsValidate(localStorageSetArgs, args);
    return options.window.localStorage.setItem(key, value);
}

const localStorageSetArgs = valueArgsModel([
    {'name': 'key', 'type': 'string'},
    {'name': 'value'}
]);


//
// Markdown functions
//


// $function: markdownEscape
// $group: Markdown
// $doc: Escape text for inclusion in Markdown text
// $arg text: The text
// $return: The escaped text
function markdownEscape(args) {
    const [text] = valueArgsValidate(markdownEscapeArgs, args);
    return escapeMarkdownText(text);
}

const markdownEscapeArgs = valueArgsModel([
    {'name': 'text', 'type': 'string'}
]);


// $function: markdownHeaderId
// $group: Markdown
// $doc: Compute the Markdown header element ID for some text
// $arg text: The text
// $return: The header element ID
function markdownHeaderId(args) {
    const [text] = valueArgsValidate(markdownHeaderIdArgs, args);
    return markdownModelHeaderId(text);
}

const markdownHeaderIdArgs = valueArgsModel([
    {'name': 'text', 'type': 'string'}
]);


// $function: markdownParse
// $group: Markdown
// $doc: Parse Markdown text
// $arg lines...: The Markdown text lines (may contain nested arrays of un-split lines)
// $return: The [Markdown model](https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown')
function markdownParse(lines) {
    return parseMarkdown(lines.flat());
}


// $function: markdownPrint
// $group: Markdown
// $doc: Render Markdown text
// $arg lines...: The Markdown text lines (may contain nested arrays of un-split lines)
function markdownPrint(lines, options) {
    const {runtime} = options;
    runtime.setMarkdown();
    runtime.addMarkdown(lines);
}


// $function: markdownTitle
// $group: Markdown
// $doc: Compute the title of a [Markdown model](https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown')
// $arg markdownModel: The [Markdown model](https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown')
// $return: The Markdown title or null if there is no title
function markdownTitle(args) {
    const [markdownModel] = valueArgsValidate(markdownTitleArgs, args);
    return getMarkdownTitle(markdownModel);
}

const markdownTitleArgs = valueArgsModel([
    {'name': 'markdownModel', 'type': 'object'},
]);


//
// Schema functions
//


// $function: schemaElements
// $group: Schema
// $doc: Get a schema type's documentation [element model](https://github.com/craigahobbs/element-model#readme).
// $doc: Render the element model with the [elementModelRender](#var.vName='elementModelRender') function.
// $arg types: The [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
// $arg typeName: The type name
// $arg actionURLs: Optional (default is null). The
// $arg actionURLs: [action URL overrides](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='ActionURL').
// $return: The schema type's documentation [element model](https://github.com/craigahobbs/element-model#readme)
function schemaElements(args, options) {
    const [types, typeName, actionURLs = null] = valueArgsValidate(schemaElementsArgs, args);
    const schemaOptions = {
        'params': encodeQueryString(options.params),
        'markdownOptions': options.markdownOptions
    };
    if (actionURLs !== null) {
        schemaOptions.actionURLs = actionURLs;
    }
    return schemaMarkdownDoc(types, typeName, schemaOptions);
}

const schemaElementsArgs = valueArgsModel([
    {'name': 'types', 'type': 'object'},
    {'name': 'typeName', 'type': 'string'},
    {'name': 'actionURLs', 'type': 'array', 'nullable': true}
]);


//
// Session storage functions
//


// $function: sessionStorageClear
// $group: Session Storage
// $doc: Clear all keys from the browser's session storage
function sessionStorageClear(unusedArgs, options) {
    return options.window.sessionStorage.clear();
}


// $function: sessionStorageGet
// $group: Session Storage
// $doc: Get a browser session storage key's value
// $arg key: The key string
// $return: The session storage value string or null if the key does not exist
function sessionStorageGet(args, options) {
    const [key] = valueArgsValidate(sessionStorageGetArgs, args);
    return options.window.sessionStorage.getItem(key);
}

const sessionStorageGetArgs = valueArgsModel([
    {'name': 'key', 'type': 'string'}
]);


// $function: sessionStorageRemove
// $group: Session Storage
// $doc: Remove a browser session storage key
// $arg key: The key string
function sessionStorageRemove(args, options) {
    const [key] = valueArgsValidate(sessionStorageRemoveArgs, args);
    return options.window.sessionStorage.removeItem(key);
}

const sessionStorageRemoveArgs = valueArgsModel([
    {'name': 'key', 'type': 'string'}
]);


// $function: sessionStorageSet
// $group: Session Storage
// $doc: Set a browser session storage key's value
// $arg key: The key string
// $arg value: The value string
function sessionStorageSet(args, options) {
    const [key, value] = valueArgsValidate(sessionStorageSetArgs, args);
    return options.window.sessionStorage.setItem(key, value);
}

const sessionStorageSetArgs = valueArgsModel([
    {'name': 'key', 'type': 'string'},
    {'name': 'value'}
]);


//
// URL functions
//


// $function: urlObjectCreate
// $group: URL
// $doc: Create an object URL (i.e. a file download URL)
// $arg data: The object data string
// $arg contentType: Optional (default is "text/plain"). The object content type.
// $return: The object URL string
function urlObjectCreate(args, options) {
    const [data, contentType] = valueArgsValidate(urlObjectCreateArgs, args);
    return options.window.URL.createObjectURL(new Blob([data], {'type': contentType}));
}

const urlObjectCreateArgs = valueArgsModel([
    {'name': 'data', 'type': 'string'},
    {'name': 'contentType', 'type': 'string', 'default': 'text/plain'}
]);


//
// Window functions
//


// $function: windowClipboardRead
// $group: Window
// $doc: Read text from the clipboard
// $return: The clipboard text
async function windowClipboardRead(args, options) {
    return await options.window.navigator.clipboard.readText();
}


// $function: windowClipboardWrite
// $group: Window
// $doc: Write text to the clipboard
// $arg text: The text to write
async function windowClipboardWrite(args, options) {
    const [text] = valueArgsValidate(windowClipboardWriteArgs, args);
    await options.window.navigator.clipboard.writeText(text);
}

const windowClipboardWriteArgs = valueArgsModel([
    {'name': 'text', 'type': 'string'}
]);


// $function: windowHeight
// $group: Window
// $doc: Get the browser window's height
// $return: The browser window's height
function windowHeight(unusedArgs, options) {
    return options.window.innerHeight;
}


// $function: windowSetLocation
// $group: Window
// $doc: Navigate the browser window to a location URL
// $arg url: The new location URL
function windowSetLocation(args, options) {
    const [location] = valueArgsValidate(windowSetLocationArgs, args);
    const {runtime} = options;
    runtime.windowLocation = options.urlFn(location);
}

const windowSetLocationArgs = valueArgsModel([
    {'name': 'url', 'type': 'string'}
]);


// $function: windowSetResize
// $group: Window
// $doc: Set the browser window resize event handler
// $arg callback: The window resize callback function
function windowSetResize(args, options) {
    const [callback] = valueArgsValidate(windowSetResizeArgs, args);
    const {runtime} = options;
    runtime.windowResize = async () => {
        await runtime.eventHandle(async () => {
            options.statementCount = 0;
            try {
                await callback([], options);
            } catch ({message}) {
                if (options.debug) {
                    options.logFn(`MarkdownUp: Error executing windowSetResize callback: ${message}`);
                }
            }
            options.runtimeUpdateFn();
        });
    };
}

const windowSetResizeArgs = valueArgsModel([
    {'name': 'callback', 'type': 'function'}
]);


// $function: windowSetTimeout
// $group: Window
// $doc: Set the browser window timeout event handler
// $arg callback: The window timeout callback function
// $arg delay: The delay, in milliseconds, to ellapse before calling the timeout
function windowSetTimeout(args, options) {
    const [callback, delay] = valueArgsValidate(windowSetTimeoutArgs, args);
    const {runtime} = options;
    runtime.windowTimeout = [
        async () => {
            await runtime.eventHandle(async () => {
                options.statementCount = 0;
                try {
                    await callback([], options);
                } catch ({message}) {
                    if (options.debug) {
                        options.logFn(`MarkdownUp: Error executing windowSetTimeout callback: ${message}`);
                    }
                }
                options.runtimeUpdateFn();
            });
        },
        delay
    ];
}

const windowSetTimeoutArgs = valueArgsModel([
    {'name': 'callback', 'type': 'function'},
    {'name': 'delay', 'type': 'number'}
]);


// $function: windowWidth
// $group: Window
// $doc: Get the browser window's width
// $return: The browser window's width
function windowWidth(unusedArgs, options) {
    return options.window.innerWidth;
}


// markdown-script library functions
export const markdownScriptFunctions = {
    dataLineChart,
    dataTable,
    documentFontSize,
    documentInputValue,
    documentSetFocus,
    documentSetReset,
    documentSetTitle,
    documentURL,
    drawArc,
    drawCircle,
    drawClose,
    drawEllipse,
    drawHLine,
    drawHeight,
    drawImage,
    drawLine,
    drawMove,
    drawNew,
    drawOnClick,
    drawPathRect,
    drawRect,
    drawStyle,
    drawText,
    drawTextHeight,
    drawTextStyle,
    drawTextWidth,
    drawVLine,
    drawWidth,
    elementModelRender,
    localStorageClear,
    localStorageGet,
    localStorageRemove,
    localStorageSet,
    markdownEscape,
    markdownHeaderId,
    markdownParse,
    markdownPrint,
    markdownTitle,
    schemaElements,
    sessionStorageClear,
    sessionStorageGet,
    sessionStorageRemove,
    sessionStorageSet,
    urlObjectCreate,
    windowClipboardRead,
    windowClipboardWrite,
    windowHeight,
    windowSetLocation,
    windowSetResize,
    windowSetTimeout,
    windowWidth
};
