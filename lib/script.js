// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/script */

import {executeScriptAsync} from '../calc-script/lib/runtimeAsync.js';
import {markdownElements} from '../markdown-model/lib/elements.js';
import {parseMarkdown} from '../markdown-model/lib/parser.js';
import {parseScript} from '../calc-script/lib/parser.js';


/**
 * The markdown-script code block function options (based on
 * [calc-script's options]{@link https://craigahobbs.github.io/calc-script/module-lib_runtime.html#~ExecuteScriptOptions}).
 *
 * @typedef {Object} MarkdownScriptOptions
 * @property {number} fontSize - The font size, in points
 * @property {Object} params - The hash parameters object
 * @property {Object} runtime - The [markdown-script runtime state]{@link module:lib/script.MarkdownScriptRuntime}
 * @property {Object} [variables] - The map of variable name to variable value
 * @property {Object} window - The web browser window object
 * @property {function} runtimeUpdateFn - The [runtime update callback function]{@link module:lib/util~MarkdownScriptRuntimeUpdateFn}
 */

/**
 * A runtime update callback function
 *
 * @callback MarkdownScriptRuntimeUpdateFn
 */


/**
 * The markdown-script code block function
 *
 * @async
 * @param {object} codeBlock - The code block model
 * @param {Object} options - The [markdown-script options]{@link module:lib/script~MarkdownScriptOptions}
 * @returns {Object} The generated element model
 */
export async function markdownScriptCodeBlock(codeBlock, options) {
    // Add the options variables to the runtime's globals
    if ('variables' in options) {
        Object.assign(options.globals, options.variables);
    }

    // Execute the calculation script
    let errorMessage = null;
    try {
        await executeScriptAsync(parseScript(codeBlock.lines, codeBlock.startLineNumber + 1), options);
    } catch ({message}) {
        errorMessage = message;
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
 * @property {?string} documentFocus - The the runtime-set element ID to set input focus
 * @property {?string} documentTitle - The the runtime-set document title
 * @property {boolean} isDocumentReset - If true, the runtime requested a document-reset
 * @property {?string} windowLocation - The the runtime-set document location
 * @property {?function} windowTimeout - The the runtime-set timeout args (callback, delay)
 */
export class MarkdownScriptRuntime {
    /**
     * @param {Object} options - The [markdown-script options]{@link module:lib/script~MarkdownScriptOptions}
     */
    constructor(options) {
        this.options = options;
        this.elements = null;
        this.documentFocus = null;
        this.documentTitle = null;
        this.isDocumentReset = false;
        this.windowLocation = null;
        this.windowResize = null;
        this.windowTimeout = null;

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
        this.documentTitle = null;
        this.isDocumentReset = false;
        this.windowLocation = null;
        this.windowTimeout = null;
        return this.resetElements();
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
            const markdownOptions = {'headerIds': true, 'urlFn': this.options.urlFn};
            this.addElements(markdownElements(parseMarkdown(this.markdown), markdownOptions));
            this.markdown = null;
        }
    }
}
