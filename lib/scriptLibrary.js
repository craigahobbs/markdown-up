// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {
    addCalculatedField, aggregateData, filterData, joinData, parseCSV, sortData, topData, validateAggregation, validateData
} from './data.js';
import {dataTableElements, validateDataTable} from './dataTable.js';
import {escapeMarkdownText, getMarkdownTitle, parseMarkdown} from 'markdown-model/lib/parser.js';
import {lineChartElements, validateLineChart} from './lineChart.js';
import {encodeQueryString} from 'schema-markdown/lib/encode.js';
import {markdownHeaderId} from 'markdown-model/lib/elements.js';
import {schemaMarkdownDoc} from 'schema-markdown-doc/lib/schemaMarkdownDoc.js';
import {validateElements} from 'element-model/lib/elementModel.js';


/* eslint-disable id-length */


// Constants
const defaultFontFamily = 'Arial, Helvetica, sans-serif';
const fontWidthRatio = 0.6;
const pixelsPerPoint = 4 / 3;
const svgPrecision = 8;


// markdown-script library functions
export const markdownScriptFunctions = {
    //
    // Data and charting functions
    //

    // $function: dataAggregate
    // $group: Data
    // $doc: Aggregate a data array
    // $arg data: The data array
    // $arg aggregation: The [aggregation model](model.html#var.vName='Aggregation')
    // $return: The aggregated data array
    'dataAggregate': ([data, aggregation]) => aggregateData(data, validateAggregation(aggregation)),

    // $function: dataCalculatedField
    // $group: Data
    // $doc: Add a calculated field to a data array
    // $arg data: The data array
    // $arg fieldName: The calculated field name
    // $arg expr: The calculated field expression
    // $arg variables: Optional (default is null). A variables object the expression evaluation.
    // $return: The updated data array
    'dataCalculatedField': ([data, fieldName, expr, variables = null]) => addCalculatedField(data, fieldName, expr, variables),

    // $function: dataFilter
    // $group: Data
    // $doc: Filter a data array
    // $arg data: The data array
    // $arg expr: The filter expression
    // $arg variables: Optional (default is null). A variables object the expression evaluation.
    // $return: The filtered data array
    'dataFilter': ([data, expr, variables = null]) => filterData(data, expr, variables),

    // $function: dataJoin
    // $group: Data
    // $doc: Join two data arrays
    // $arg leftData: The left data array
    // $arg rightData: The right data array
    // $arg joinExpr: The [join expression](https://craigahobbs.github.io/calc-script/language/#expressions)
    // $arg rightExpr: Optional (default is null).
    // $arg rightExpr:     The right [join expression](https://craigahobbs.github.io/calc-script/language/#expressions)
    // $arg isLeftJoin: Optional (default is false). If true, perform a left join (always include left row).
    // $arg variables: Optional (default is null). A variables object for join expression evaluation.
    // $return: The joined data array
    'dataJoin': ([leftData, rightData, joinExpr, rightExpr = null, isLeftJoin = false, variables = null]) => (
        joinData(leftData, rightData, joinExpr, rightExpr, isLeftJoin, variables)
    ),

    // $function: dataLineChart
    // $group: Data
    // $doc: Draw a line chart
    // $arg data: The data array
    // $arg lineChart: The [line chart model](model.html#var.vName='LineChart')
    'dataLineChart': ([data, lineChart], options) => {
        const {runtime} = options;

        // Render the line chart
        const elements = lineChartElements(data, validateLineChart(lineChart), options);
        runtime.setElements();
        runtime.addElements({'html': 'p', 'elem': elements});

        // Set the drawing size (the chart is now the active drawing)
        runtime.drawingWidth = elements.attr.width;
        runtime.drawingHeight = elements.attr.height;
    },

    // $function: dataParseCSV
    // $group: Data
    // $doc: Parse CSV text to a data array
    // $arg text: The CSV text
    // $return: The data array
    'dataParseCSV': (text) => {
        const data = parseCSV(text);
        validateData(data, true);
        return data;
    },

    // $function: dataSort
    // $group: Data
    // $doc: Sort a data array
    // $arg data: The data array
    // $arg sorts: The sort field-name/descending-sort tuples
    // $return: The sorted data array
    'dataSort': ([data, sorts]) => sortData(data, sorts),

    // $function: dataTable
    // $group: Data
    // $doc: Draw a data table
    // $arg data: The data array
    // $arg dataTable: Optional (default is null). The [data table model](model.html#var.vName='DataTable').
    'dataTable': ([data, dataTable = null], options) => {
        const {runtime} = options;
        runtime.setElements();
        const dataTableValidated = (dataTable !== null ? validateDataTable(dataTable, options) : null);
        runtime.addElements(dataTableElements(data, dataTableValidated, options));
    },

    // $function: dataTop
    // $group: Data
    // $doc: Keep the top rows for each category
    // $arg data: The data array
    // $arg count: The number of rows to keep
    // $arg categoryFields: Optional (default is null). The category fields.
    // $return: The top data array
    'dataTop': ([data, count, categoryFields = null]) => topData(data, count, categoryFields),

    // $function: dataValidate
    // $group: Data
    // $doc: Validate a data array
    // $arg data: The data array
    // $return: The validated data array
    'dataValidate': ([data]) => {
        validateData(data);
        return data;
    },


    //
    // Document functions
    //

    // $function: documentURL
    // $group: Document
    // $doc: Fix-up relative URLs
    // $arg url: The URL
    // $return: The fixed-up URL
    'documentURL': ([url], options) => options.urlFn(url),

    // $function: getDocumentFontSize
    // $group: Document
    // $doc: Get the document font size
    // $return: The document font size, in pixels
    'getDocumentFontSize': (unused, options) => options.fontSize * pixelsPerPoint,

    // $function: getDocumentInputValue
    // $group: Document
    // $doc: Get an input element's value
    // $arg id: The input element ID
    // $return: The input element value or null if the element does not exist
    'getDocumentInputValue': ([id], options) => {
        const element = options.window.document.getElementById(id) ?? null;
        return (element !== null ? (element.value ?? null) : null);
    },

    // $function: getWindowHeight
    // $group: Document
    // $doc: Get the browser window's height
    // $return: The browser window's height
    'getWindowHeight': (unused, options) => options.window.innerHeight,

    // $function: getWindowWidth
    // $group: Document
    // $doc: Get the browser window's width
    // $return: The browser window's width
    'getWindowWidth': (unused, options) => options.window.innerWidth,

    // $function: setDocumentFocus
    // $group: Document
    // $doc: Set focus to an element
    // $arg id: The element ID
    'setDocumentFocus': ([id], options) => {
        const {runtime} = options;
        runtime.documentFocus = id;
    },

    // $function: setDocumentReset
    // $group: Document
    // $doc: Set the document reset element
    // $arg id: The element ID
    'setDocumentReset': ([id], options) => {
        const {runtime} = options;
        runtime.documentReset = id;
    },

    // $function: setDocumentTitle
    // $group: Document
    // $doc: Set the document title
    // $arg title: The document title string
    'setDocumentTitle': ([title], options) => {
        const {runtime} = options;
        runtime.documentTitle = title;
    },

    // $function: setWindowLocation
    // $group: Document
    // $doc: Navigate the browser window to a location URL
    // $arg url: The new location URL
    'setWindowLocation': ([location], options) => {
        const {runtime} = options;
        runtime.windowLocation = options.urlFn(location);
    },

    // $function: setWindowResize
    // $group: Document
    // $doc: Set the browser window resize event handler
    // $arg callback: The window resize callback function
    'setWindowResize': ([callback], options) => {
        const {runtime} = options;
        runtime.windowResize = async () => {
            options.statementCount = 0;
            await callback([], options);
            options.runtimeUpdateFn();
        };
    },

    // $function: setWindowTimeout
    // $group: Document
    // $doc: Set the browser window timeout event handler
    // $arg callback: The window timeout callback function
    // $arg delay: The delay, in milliseconds, to ellapse before calling the timeout
    'setWindowTimeout': ([callback, delay], options) => {
        const {runtime} = options;
        runtime.windowTimeout = [
            async () => {
                options.statementCount = 0;
                await callback([], options);
                options.runtimeUpdateFn();
            },
            delay
        ];
    },


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
    'drawArc': ([rx, ry, angle, largeArcFlag, sweepFlag, x, y], options) => {
        const {runtime} = options;
        runtime.setDrawingPath();
        runtime.drawingPath.push(
            `A ${rx.toFixed(svgPrecision)} ${ry.toFixed(svgPrecision)} ${angle.toFixed(svgPrecision)} ` +
                `${largeArcFlag ? 1 : 0} ${sweepFlag ? 1 : 0} ${x.toFixed(svgPrecision)} ${y.toFixed(svgPrecision)}`
        );
    },

    // $function: drawCircle
    // $group: Drawing
    // $doc: Draw a circle
    // $arg cx: The x-coordinate of the center of the circle
    // $arg cy: The y-coordinate of the center of the circle
    // $arg r: The radius of the circle
    'drawCircle': ([cx, cy, r], options) => {
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
    },

    // $function: drawClose
    // $group: Drawing
    // $doc: Close the current drawing path
    'drawClose': (unused, options) => {
        const {runtime} = options;
        runtime.setDrawingPath();
        runtime.drawingPath.push('Z');
    },

    // $function: drawEllipse
    // $group: Drawing
    // $doc: Draw an ellipse
    // $arg cx: The x-coordinate of the center of the ellipse
    // $arg cy: The y-coordinate of the center of the ellipse
    // $arg rx: The x-radius of the ellipse
    // $arg ry: The y-radius of the ellipse
    'drawEllipse': ([cx, cy, rx, ry], options) => {
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
    },

    // $function: drawHLine
    // $group: Drawing
    // $doc: Draw a horizontal line from the current point to the end point
    // $arg x: The x-coordinate of the end point
    'drawHLine': ([x], options) => {
        const {runtime} = options;
        runtime.setDrawingPath();
        runtime.drawingPath.push(`H ${x.toFixed(svgPrecision)}`);
    },

    // $function: drawImage
    // $group: Drawing
    // $doc: Draw an image
    // $arg x: The x-coordinate of the center of the image
    // $arg y: The y-coordinate of the center of the image
    // $arg width: The width of the image
    // $arg height: The height of the image
    // $arg href: The image resource URL
    'drawImage': ([x, y, width, height, href], options) => {
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
    },

    // $function: drawLine
    // $group: Drawing
    // $doc: Draw a line from the current point to the end point
    // $arg x: The x-coordinate of the end point
    // $arg y: The y-coordinate of the end point
    'drawLine': ([x, y], options) => {
        const {runtime} = options;
        runtime.setDrawingPath();
        runtime.drawingPath.push(`L ${x.toFixed(svgPrecision)} ${y.toFixed(svgPrecision)}`);
    },

    // $function: drawMove
    // $group: Drawing
    // $doc: Move the path's drawing point
    // $arg x: The x-coordinate of the new drawing point
    // $arg y: The y-coordinate of the new drawing point
    'drawMove': ([x, y], options) => {
        const {runtime} = options;
        runtime.setDrawingPath();
        runtime.drawingPath.push(`M ${x.toFixed(svgPrecision)} ${y.toFixed(svgPrecision)}`);
    },

    // $function: drawOnClick
    // $group: Drawing
    // $doc: Set the most recent drawing object's on-click event handler
    // $arg callback: The on-click event callback function (x, y)
    'drawOnClick': ([callback], options) => {
        const {runtime} = options;
        const svg = runtime.setDrawing();
        const clickElement = svg.elem.length === 0 ? svg : svg.elem[svg.elem.length - 1];
        clickElement.callback = (element) => {
            element.addEventListener('click', async (event) => {
                const boundingRect = event.target.ownerSVGElement.getBoundingClientRect();
                options.statementCount = 0;
                await callback([event.clientX - boundingRect.left, event.clientY - boundingRect.top], options);
                options.runtimeUpdateFn();
            });
        };
    },

    // $function: drawRect
    // $group: Drawing
    // $doc: Draw a rectangle
    // $arg x: The x-coordinate of the top-left of the rectangle
    // $arg y: The y-coordinate of the top-left of the rectangle
    // $arg width: The width of the rectangle
    // $arg height: The height of the rectangle
    // $arg rx: Optional (default is null). The horizontal corner radius of the rectangle.
    // $arg ry: Optional (default is null). The vertical corner radius of the rectangle.
    'drawRect': ([x, y, width, height, rx = null, ry = null], options) => {
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
    },

    // $function: drawStyle
    // $group: Drawing
    // $doc: Set the current drawing styles
    // $arg stroke: Optional (default is 'black'). The stroke color.
    // $arg strokeWidth: Optional (default is 1). The stroke width.
    // $arg fill: Optional (default is 'none'). The fill color.
    // $arg strokeDashArray: Optional (default is 'none'). The stroke
    // $arg strokeDashArray: [dash array](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray#usage_notes).
    'drawStyle': ([stroke = 'black', strokeWidth = 1, fill = 'none', strokeDashArray = 'none'], options) => {
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
    },

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
    'drawText': ([text, x, y, textAnchor = 'middle', dominantBaseline = 'middle'], options) => {
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
    },

    // $function: drawTextStyle
    // $group: Drawing
    // $doc: Set the current text drawing styles
    // $arg fontSizePx: Optional (default is null, the default font size). The text font size, in pixels.
    // $arg textFill: Optional (default is 'black'). The text fill color.
    // $arg bold: Optional (default is false). If true, text is bold.
    // $arg italic: Optional (default is false). If true, text is italic.
    // $arg fontFamily: Optional (default is null, the default font family). The text font family.
    'drawTextStyle': ([fontSizePx = null, textFill = 'black', bold = false, italic = false, fontFamily = null], options) => {
        const {runtime} = options;
        runtime.drawingFontSizePx = (fontSizePx !== null ? fontSizePx : options.fontSize * pixelsPerPoint);
        runtime.drawingFontFill = textFill;
        runtime.drawingFontBold = bold;
        runtime.drawingFontItalic = italic;
        runtime.drawingFontFamily = (fontFamily !== null ? fontFamily : defaultFontFamily);
    },

    // $function: drawVLine
    // $group: Drawing
    // $doc: Draw a vertical line from the current point to the end point
    // $arg y: The y-coordinate of the end point
    'drawVLine': ([y], options) => {
        const {runtime} = options;
        runtime.setDrawingPath();
        runtime.drawingPath.push(`V ${y.toFixed(svgPrecision)}`);
    },

    // $function: getDrawingHeight
    // $group: Drawing
    // $doc: Get the current drawing's height
    // $return: The current drawing's height
    'getDrawingHeight': (unused, options) => options.runtime.drawingHeight,

    // $function: getDrawingWidth
    // $group: Drawing
    // $doc: Get the current drawing's width
    // $return: The current drawing's width
    'getDrawingWidth': (unused, options) => options.runtime.drawingWidth,

    // $function: getTextHeight
    // $group: Drawing
    // $doc: Compute the text's height to fit the width
    // $arg text: The text
    // $arg width: The width of the text. If 0, the default font size (in pixels) is returned.
    // $return: The text's height
    'getTextHeight': ([text, width], options) => (width > 0 ? width / (fontWidthRatio * text.length) : options.runtime.drawingFontSizePx),

    // $function: getTextWidth
    // $group: Drawing
    // $doc: Compute the text's width
    // $arg text: The text
    // $arg fontSizePx: The text font size, in pixels
    // $return: The text's width
    'getTextWidth': ([text, fontSizePx]) => fontWidthRatio * fontSizePx * text.length,

    // $function: setDrawingSize
    // $group: Drawing
    // $doc: Set the current drawing's size
    // $arg width: The width of the drawing
    // $arg height: The height of the drawing
    'setDrawingSize': ([width, height], options) => {
        const {runtime} = options;
        runtime.drawingWidth = width;
        runtime.drawingHeight = height;
        runtime.setDrawing(true);
    },


    //
    // Element Model functions
    //

    // $function: elementModelRender
    // $group: Element Model
    // $doc: Render an [element model](https://github.com/craigahobbs/element-model#readme)
    // $arg element: The [element model](https://github.com/craigahobbs/element-model#readme)
    'elementModelRender': ([elements], options) => {
        const {runtime} = options;
        runtime.setElements();
        elementModelWrapCallbacks(elements, options);
        runtime.addElements(validateElements(elements));
    },


    //
    // Local storage functions
    //

    // $function: localStorageClear
    // $group: Local Storage
    // $doc: Clear all keys from the browser's local storage
    'localStorageClear': (unused, options) => options.window.localStorage.clear(),

    // $function: localStorageGet
    // $group: Local Storage
    // $doc: Get a browser local storage key's value
    // $arg key: The key string
    // $return: The local storage value string or null if the key does not exist
    'localStorageGet': ([key], options) => options.window.localStorage.getItem(key),

    // $function: localStorageSet
    // $group: Local Storage
    // $doc: Set a browser local storage key's value
    // $arg key: The key string
    // $arg value: The value string
    'localStorageSet': ([key, value], options) => options.window.localStorage.setItem(key, value),

    // $function: localStorageRemove
    // $group: Local Storage
    // $doc: Remove a browser local storage key
    // $arg key: The key string
    'localStorageRemove': ([key], options) => options.window.localStorage.removeItem(key),


    //
    // Markdown functions
    //

    // $function: markdownEscape
    // $group: Markdown
    // $doc: Escape text for inclusion in Markdown text
    // $arg text: The text
    // $return: The escaped text
    'markdownEscape': ([text]) => escapeMarkdownText(text),

    // $function: markdownHeaderId
    // $group: Markdown
    // $doc: Compute the Markdown header element ID for some text
    // $arg text: The text
    // $return: The header element ID
    'markdownHeaderId': ([text]) => markdownHeaderId(text),

    // $function: markdownParse
    // $group: Markdown
    // $doc: Parse Markdown text
    // $arg lines: The Markdown text lines (may contain nested arrays of un-split lines)
    // $return: The [Markdown model](https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown')
    'markdownParse': (lines) => parseMarkdown(lines.flat()),

    // $function: markdownPrint
    // $group: Markdown
    // $doc: Render Markdown text
    // $arg lines: The Markdown text lines (may contain nested arrays of un-split lines)
    'markdownPrint': (lines, options) => {
        const {runtime} = options;
        runtime.setMarkdown();
        runtime.addMarkdown(lines);
    },

    // $function: markdownTitle
    // $group: Markdown
    // $doc: Compute the title of a [Markdown model](https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown')
    // $arg markdownModel: The [Markdown model](https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown')
    // $return: The Markdown title or null if there is no title
    'markdownTitle': ([markdownModel]) => getMarkdownTitle(markdownModel),


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
    'schemaElements': ([types, typeName, actionURLs = null], options) => {
        const params = encodeQueryString(options.params);
        const schemaOptions = {params};
        if (actionURLs !== null) {
            schemaOptions.actionURLs = actionURLs;
        }
        return schemaMarkdownDoc(types, typeName, schemaOptions);
    },


    //
    // Session storage functions
    //

    // $function: sessionStorageClear
    // $group: Session Storage
    // $doc: Clear all keys from the browser's session storage
    'sessionStorageClear': (unused, options) => options.window.sessionStorage.clear(),

    // $function: sessionStorageGet
    // $group: Session Storage
    // $doc: Get a browser session storage key's value
    // $arg key: The key string
    // $return: The session storage value string or null if the key does not exist
    'sessionStorageGet': ([key], options) => options.window.sessionStorage.getItem(key),

    // $function: sessionStorageSet
    // $group: Session Storage
    // $doc: Set a browser session storage key's value
    // $arg key: The key string
    // $arg value: The value string
    'sessionStorageSet': ([key, value], options) => options.window.sessionStorage.setItem(key, value),

    // $function: sessionStorageRemove
    // $group: Session Storage
    // $doc: Remove a browser session storage key
    // $arg key: The key string
    'sessionStorageRemove': ([key], options) => options.window.sessionStorage.removeItem(key)
};


// Helper function for elementModelRender function
function elementModelWrapCallbacks(elements, options) {
    if (Array.isArray(elements)) {
        for (const childElements of elements) {
            elementModelWrapCallbacks(childElements, options);
        }
    } else if (elements !== null && typeof elements === 'object') {
        if ('elem' in elements) {
            elementModelWrapCallbacks(elements.elem, options);
        }

        // Element callback attribute must be map of event => callback
        if ('callback' in elements) {
            const elementEvents = elements.callback;
            if (elementEvents !== null && typeof elementEvents === 'object') {
                // Wrap the event handler function
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
                            await elementEventCallback(eventArgs, options);
                            options.runtimeUpdateFn();
                        });
                    }
                };
            }
        }
    }
}
