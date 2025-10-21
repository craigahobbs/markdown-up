// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {executeScriptAsync} from '../bare-script/lib/runtimeAsync.js';
import {lintScript} from '../bare-script/lib/model.js';
import {markdownElements} from '../markdown-model/lib/elements.js';
import {parseMarkdown} from '../markdown-model/lib/parser.js';
import {parseScript} from '../bare-script/lib/parser.js';


/**
 * The markdown-script code block function options (based on
 * [bare-script's options]{@link https://craigahobbs.github.io/bare-script/module-lib_runtime.html#~ExecuteScriptOptions}).
 *
 * @typedef {Object} MarkdownScriptOptions
 * @property {number} fontSize - The font size, in points
 * @property {Object} params - The hash parameters object
 * @property {Object} runtime - The [markdown-script runtime state]{@link module:lib/script.MarkdownScriptRuntime}
 * @property {Object} [variables] - The map of variable name to variable value
 * @property {Object} window - The web browser window object
 * @property {function} runtimeUpdateFn - The [runtime update callback function]{@link module:lib/util~MarkdownScriptRuntimeUpdateFn}
 *
 * @ignore
 */


/**
 * A runtime update callback function
 *
 * @callback MarkdownScriptRuntimeUpdateFn
 *
 * @ignore
 */


/**
 * The markdown-script code block function
 *
 * @async
 * @param {object} codeBlock - The code block model
 * @param {Object} options - The [markdown-script options]{@link module:lib/script~MarkdownScriptOptions}
 * @returns {Object} The generated element model
 *
 * @ignore
 */
export async function markdownScriptCodeBlock(codeBlock, options) {
    // Add the options variables to the runtime's globals
    if ('variables' in options) {
        Object.assign(options.globals, options.variables);
    }

    // Log script execution begin
    let timeBegin;
    if ('logFn' in options && options.debug) {
        timeBegin = performance.now();
        options.logFn(`MarkdownUp: Executing script at line number ${codeBlock.startLineNumber + 1} ...`);
    }

    // Execute the calculation script
    let errorMessage = null;
    try {
        // Parse the script
        const script = parseScript(codeBlock.lines, codeBlock.startLineNumber + 1);

        // Run the bare-script linter?
        if ('logFn' in options && options.debug) {
            const warnings = lintScript(script);
            const warningPrefix = `MarkdownUp: Script static analysis...`;
            if (warnings.length === 0) {
                options.logFn(`${warningPrefix} OK`);
            } else {
                options.logFn(`${warningPrefix} ${warnings.length} warning${warnings.length > 1 ? 's' : ''}:`);
                for (const warning of warnings) {
                    options.logFn(`MarkdownUp: ${warning}`);
                }
            }
        }

        // Execute the script
        await executeScriptAsync(script, options);
    } catch ({message}) {
        errorMessage = message;
    }

    // Log script execution end with timing
    if ('logFn' in options && options.debug) {
        const timeEnd = performance.now();
        options.logFn(`MarkdownUp: Script executed in ${(timeEnd - timeBegin).toFixed(1)} milliseconds`);
    }

    // Reset the runtime
    let elements = options.runtime.resetElements();

    // If an error occurred, render the error message
    if (errorMessage !== null) {
        elements = [elements, {'html': 'pre', 'elem': {'text': errorMessage}}];
    }

    return elements;
}


// Constants
const defaultDrawingWidth = 300;
const defaultDrawingHeight = 200;
const defaultFontFamily = 'Arial, Helvetica, sans-serif';
const pixelsPerPoint = 4 / 3;


/**
 * The markdown-script runtime state
 *
 * @property {Object} options - The [markdown-script options]{@link module:lib/script~MarkdownScriptOptions}
 * @property {?Object[]} elements - The runtime-generated element model
 * @property {?string} documentFocus - The runtime-set input-focus element ID
 * @property {?function} documentKeyDown - The runtime-set document keydown callback
 * @property {?string} documentReset - The runtime-set document-reset element ID
 * @property {?string} documentTitle - The runtime-set document title
 * @property {?string} windowLocation - The runtime-set document location
 * @property {?function} windowResize - The runtime-set resize callback
 * @property {?Array} windowTimeout - The runtime-set timeout args (callback, delay)
 *
 * @ignore
 */
export class MarkdownScriptRuntime {
    /**
     * @param {Object} options - The [markdown-script options]{@link module:lib/script~MarkdownScriptOptions}
     */
    constructor(options) {
        this.options = options;
        this.elements = null;
        this.documentFocus = null;
        this.documentKeyDown = null;
        this.documentReset = null;
        this.documentTitle = null;
        this.windowLocation = null;
        this.windowResize = null;
        this.windowTimeout = null;
        this.eventQueue = Promise.resolve();

        // Drawing-path and Markdown function state
        this.drawingPath = null;
        this.markdown = null;

        // Drawing state
        this.drawingWidth = defaultDrawingWidth;
        this.drawingHeight = defaultDrawingHeight;

        // Drawing path style
        this.drawingPathStroke = 'black';
        this.drawingPathStrokeWidth = 1;
        this.drawingPathStrokeDashArray = 'none';
        this.drawingPathFill = 'none';

        // Drawing text style
        this.drawingFontFamily = defaultFontFamily;
        this.drawingFontSizePx = options.fontSize * pixelsPerPoint;
        this.drawingFontFill = 'black';
        this.drawingFontBold = false;
        this.drawingFontItalic = false;
    }


    // Reset the runtime state
    reset() {
        this.documentFocus = null;
        this.documentKeyDown = null;
        this.documentReset = null;
        this.documentTitle = null;
        this.windowLocation = null;
        this.windowResize = null;
        this.windowTimeout = null;
        return this.resetElements();
    }


    // Handle a runtime event
    eventHandle(callback) {
        this.eventQueue = this.eventQueue.then(callback);
        return this.eventQueue;
    }


    // Reset the runtime elements
    resetElements() {
        let elements = null;
        if (this.elements !== null) {
            this.setElements();
            ({elements} = this);
        }
        this.elements = null;
        return elements;
    }


    // Helper method to prepare runtime for adding elements
    setElements() {
        if (this.elements === null) {
            this.elements = [];
        }
        this.finishDrawingPath();
        this.finishMarkdown();
    }


    // Helper method to add runtime elements
    addElements(elements) {
        this.elements.push(elements);
    }


    // Helper method to start an SVG drawing
    setDrawing(newDrawing = false) {
        this.setElements();
        let svg = this.getDrawingSVG();
        if (svg === null || newDrawing) {
            svg = {
                'svg': 'svg',
                'attr': {
                    'width': this.drawingWidth,
                    'height': this.drawingHeight
                },
                'elem': []
            };
            this.elements.push({'html': 'p', 'elem': svg});
        }
        return svg;
    }


    // Helper method to get the current SVG drawing element
    getDrawingSVG() {
        const par = (this.elements.length !== 0 ? this.elements[this.elements.length - 1] : null);
        const svg = (par !== null && par.html === 'p' && 'elem' in par ? par.elem : null);
        return svg !== null && svg.svg === 'svg' ? svg : null;
    }


    // Helper method to start an SVG drawing path
    setDrawingPath() {
        if (this.drawingPath === null) {
            const svg = this.setDrawing();
            svg.elem.push({
                'svg': 'path',
                'attr': {
                    'fill': this.drawingPathFill,
                    'stroke': this.drawingPathStroke,
                    'stroke-width': this.drawingPathStrokeWidth,
                    'stroke-dasharray': this.drawingPathStrokeDashArray,
                    'd': ''
                }
            });
            this.drawingPath = [];
        }
    }


    // Helper method to finish the current SVG drawing path
    finishDrawingPath() {
        if (this.drawingPath !== null) {
            const svg = this.getDrawingSVG();
            const path = svg.elem[svg.elem.length - 1];
            // eslint-disable-next-line id-length
            path.attr.d = this.drawingPath.join(' ');
            this.drawingPath = null;
        }
    }


    // Helper method to start a Markdown block
    setMarkdown() {
        if (this.markdown === null) {
            this.setElements();
            this.markdown = [];
        }
    }


    // Helper method to flatten and add Markdown text lines
    addMarkdown(lines) {
        this.markdown.push(...lines.flat());
    }


    // Helper method to finish the current Markdown block and add its elements
    finishMarkdown() {
        if (this.markdown !== null) {
            try {
                this.addElements(markdownElements(parseMarkdown(this.markdown), this.options.markdownOptions));
            } catch {
                // Do nothing
            }
            this.markdown = null;
        }
    }
}
