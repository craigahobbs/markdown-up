// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/app */

import {MarkdownScriptRuntime, markdownScriptCodeBlock} from './script.js';
import {decodeQueryString, encodeQueryString} from 'schema-markdown/lib/encode.js';
import {getBaseURL, isRelativeURL, markdownElementsAsync} from 'markdown-model/lib/elements.js';
import {getMarkdownTitle, parseMarkdown} from 'markdown-model/lib/parser.js';
import {SchemaMarkdownParser} from 'schema-markdown/lib/parser.js';
import {barChartCodeBlock} from './barChart.js';
import {dataTableCodeBlock} from './dataTable.js';
import {evaluateExpression} from 'calc-script/lib/runtime.js';
import {lineChartCodeBlock} from './lineChart.js';
import {markdownScriptFunctions} from './scriptLibrary.js';
import {parseExpression} from 'calc-script/lib/parser.js';
import {renderElements} from 'element-model/lib/elementModel.js';
import {schemaMarkdownDoc} from 'schema-markdown-doc/lib/schemaMarkdownDoc.js';
import {validateType} from 'schema-markdown/lib/schema.js';


// The application's hash parameter type model
const markdownUpTypesSmd = `\
#
# [MarkdownUp](https://craigahobbs.github.io/markdown-up/) is a Markdown viewer.
#
# ## Hash Parameters
#
# MarkdownUp recognizes the following hash parameters:
#
struct MarkdownUp

    # The resource URL
    optional string url

    # Optional command
    optional Command cmd

    # The menu visibility (default is collapsed)
    optional int(== 1) menu

    # The font size
    optional int(>= 8, <= 18) fontSize

    # The line height
    optional int(>= 1, <= 2) lineHeight

    # Variable expressions
    optional string{} var

    # If true, enable debug behavior
    optional int(== 1) debug


# A MarkdownUp application command
union Command

    # Display the hash parameters documentation
    int(== 1) help

    # Show the resource's Markdown text
    int(== 1) markdown
`;
const markdownUpTypes = new SchemaMarkdownParser(markdownUpTypesSmd).types;


/**
 * The MarkdownUp application options
 *
 * @typedef {Object} MarkdownUpOptions
 * @property {number} [fontSize = 12] - The font size, in points
 * @property {number} [lineHeight = 1.2] - The line height, in em
 * @property {?string} [markdownText = null] - The default Markdown text
 * @property {boolean} [menu = true] - If true, show the menu
 * @property {string} [url = 'README.md'] - The default resource URL
 */


/**
 * The MarkdownUp application
 *
 * @property {Object} window - The web browser window object
 * @property {?Object} params - The validated hash parameters object
 * @property {number} fontSize - The font size, in points
 * @property {number} lineHeight - The line height, in em
 * @property {?string} markdownText - The default Markdown text
 * @property {boolean} menu - If true, show the menu
 * @property {string} url - The default resource URL
 * @property {?function} runtimeWindowResize - The runtime-set window resize event listener function
 * @property {?number} runtimeTimeoutId - The runtime-set timeout ID
 */
export class MarkdownUp {
    /**
     * Create an application instance
     *
     * @param {Object} window - The web browser window object
     * @param {Object} [options] - The [application options]{@link module:lib/app~MarkdownUpOptions}
     */
    constructor(window, {fontSize = 12, lineHeight = 1.2, markdownText = null, menu = true, url = 'README.md'} = {}) {
        this.window = window;
        this.params = null;
        this.fontSize = fontSize;
        this.lineHeight = lineHeight;
        this.markdownText = markdownText;
        this.menu = menu;
        this.url = url;
        this.runtimeWindowResize = null;
        this.runtimeTimeoutId = null;
    }


    /**
     * Run the application. This method calls the render method and subscribes to hash parameter
     * changes to re-render.
     */
    async run() {
        await this.render();
        this.window.addEventListener('hashchange', () => this.render(), false);
    }


    /**
     * Render the application
     */
    async render() {
        // Parse the hash parameters and render the application element model
        let result;
        let isError = false;
        try {
            // Validate hash parameters
            const paramsPrev = this.params;
            this.updateParams();

            // Skip the render if the page params haven't changed
            if (paramsPrev !== null && JSON.stringify(paramsPrev) === JSON.stringify(this.params)) {
                return;
            }
        } catch ({message}) {
            result = {
                'title': 'MarkdownUp',
                'elements': {'html': 'p', 'elem': {'text': `Error: ${message}`}}
            };
            isError = true;
        }

        // Call the application main and validate the result
        this.clearRuntimeCallbacks();
        if (!isError) {
            result = await this.main();
        }

        // Set the font size
        const fontSize = (this.params !== null && 'fontSize' in this.params ? this.params.fontSize : this.fontSize);
        this.window.document.documentElement.style.setProperty('--markdown-model-font-size', `${fontSize}pt`);

        // Set the line height
        const lineHeight = (this.params !== null && 'lineHeight' in this.params ? this.params.lineHeight : this.lineHeight);
        this.window.document.documentElement.style.setProperty('--markdown-model-line-height', `${lineHeight}em`);

        // Set the window title
        const title = result.title ?? null;
        if (title !== null) {
            this.window.document.title = title;
        }

        // Timeout?
        if ('timeout' in result) {
            this.runtimeTimeoutId = this.window.setTimeout(...result.timeout);
        }

        // Window resize event handler?
        if ('resize' in result) {
            this.runtimeWindowResize = result.resize;
            this.window.addEventListener('resize', result.resize);
        }

        // Render the element model
        renderElements(this.window.document.body, result.elements);

        // Focus?
        if ('focus' in result) {
            this.setDocumentFocus(result.focus);
        }

        // Navigate?
        // Note: This is done after render since it may have no effect (in which case we need to render)
        if ('location' in result && result.location !== null) {
            this.window.location.href = result.location;
            return;
        }

        // If there is a URL hash ID, re-navigate to go there since it was just rendered. After the
        // first render, re-render is short-circuited by the unchanged hash param check above.
        if (!isError && getHashID(this.window.location.hash) !== null) {
            this.window.location.href = this.window.location.hash;
        }
    }


    /**
     * Parse and validate the hash parameters
     *
     * @param {?string} [paramString = null] - Optional parameter string for testing
     */
    updateParams(paramString = null) {
        // Clear, then validate the hash parameters (may throw)
        this.params = null;

        // Decode the params string
        const params = decodeQueryString(paramString !== null ? paramString : this.window.location.hash.slice(1));

        // Validate the params
        this.params = validateType(markdownUpTypes, 'MarkdownUp', params);
    }


    clearRuntimeCallbacks(clearResize = true) {
        // Clear the runtime timeout ID, if one is set
        if (this.runtimeTimeoutId !== null) {
            this.window.clearTimeout(this.runtimeTimeoutId);
            this.runtimeTimeoutId = null;
        }

        // Clear the window resize event handler
        if (clearResize && this.runtimeWindowResize !== null) {
            this.window.removeEventListener('resize', this.runtimeWindowResize);
            this.runtimeWindowResize = null;
        }
    }


    setDocumentFocus(focusId) {
        const element = this.window.document.getElementById(focusId);
        if (element !== null) {
            element.focus();
            if ('selectionStart' in element) {
                element.selectionStart = element.value.length;
                element.selectionEnd = element.value.length;
            }
        }
    }


    /**
     * The application's main entry point
     *
     * @returns {Object}
     */
    async main() {
        // Help?
        if ('cmd' in this.params && 'help' in this.params.cmd) {
            return {
                'title': 'MarkdownUp',
                'elements': [
                    schemaMarkdownDoc(markdownUpTypes, 'MarkdownUp', {'params': encodeQueryString(this.params)}),
                    this.burgerElements()
                ]
            };
        }

        // Get the Markdown text
        const urlOverride = 'url' in this.params && this.params.url !== '';
        const url = urlOverride ? this.params.url : this.url;
        let markdownText = null;
        if (this.markdownText !== null && !urlOverride) {
            ({markdownText} = this);
        } else {
            // Fetch the Markdown text resource URL
            const response = await this.window.fetch(url);
            if (!response.ok) {
                const status = response.statusText;
                return {
                    'title': 'MarkdownUp',
                    'elements': {
                        'html': 'p',
                        'elem': {'text': `Error: Could not fetch "${url}"${status === '' ? '' : ` - ${JSON.stringify(status)}`}`}
                    }
                };
            }
            markdownText = await response.text();
        }

        // Parse the Markdown and get the title
        const markdownModel = parseMarkdown(markdownText);
        const markdownTitle = getMarkdownTitle(markdownModel);

        // Display the Markdown?
        if ('cmd' in this.params && 'markdown' in this.params.cmd) {
            return {
                'title': markdownTitle,
                'elements': [
                    {'html': 'div', 'attr': {'class': 'markdown'}, 'elem': {'text': markdownText}},
                    this.burgerElements()
                ]
            };
        }

        // Render the Markdown
        const scriptOptions = this.createScriptOptions(url);
        const result = {
            'title': markdownTitle,
            'elements': [
                // Add a top hash ID, if necessary
                Object.keys(this.params).length === 0
                    ? null : {'html': 'div', 'attr': {'id': encodeQueryString(this.params), 'style': 'display=none'}},

                // Render the markdown
                await markdownElementsAsync(markdownModel, {
                    'codeBlocks': {
                        'bar-chart': (codeBlock) => barChartCodeBlock(codeBlock, scriptOptions),
                        'data-table': (codeBlock) => dataTableCodeBlock(codeBlock, scriptOptions),
                        'line-chart': (codeBlock) => lineChartCodeBlock(codeBlock, scriptOptions),
                        'markdown-script': (codeBlock) => markdownScriptCodeBlock(codeBlock, scriptOptions)
                    },
                    'urlFn': (urlRaw) => this.modifyURL(urlRaw, url),
                    'headerIds': true
                }),

                // Popup menu burger
                this.burgerElements()
            ]
        };

        // Set any runtime side-effects
        if (scriptOptions.runtime.documentFocus !== null) {
            result.focus = scriptOptions.runtime.documentFocus;
        }
        if (scriptOptions.runtime.documentTitle !== null) {
            result.title = scriptOptions.runtime.documentTitle;
        }
        if (scriptOptions.runtime.windowLocation !== null) {
            result.location = scriptOptions.runtime.windowLocation;
        }
        if (scriptOptions.runtime.windowResize !== null) {
            result.resize = scriptOptions.runtime.windowResize;
        }
        if (scriptOptions.runtime.windowTimeout !== null) {
            result.timeout = scriptOptions.runtime.windowTimeout;
        }

        // Reset the runtime
        scriptOptions.runtime.reset();

        return result;
    }


    createScriptOptions(resourceURL) {
        const scriptOptions = {
            // eslint-disable-next-line require-await
            'fetchFn': async (fetchURL, options) => this.window.fetch(fetchURL, options),
            'fontSize': (this.params !== null && 'fontSize' in this.params ? this.params.fontSize : this.fontSize),
            'params': this.params,
            'urlFn': (url) => this.modifyURL(url, resourceURL),
            'window': this.window
        };

        // Add log function, if debugging
        if ('debug' in this.params) {
            scriptOptions.logFn = (text) => {
                this.window.console.log(text);
            };
        }

        // Add hash parameter variables, if any
        if ('var' in this.params) {
            scriptOptions.variables = {};
            for (const varName of Object.keys(this.params.var)) {
                const varExpr = parseExpression(this.params.var[varName]);
                scriptOptions.variables[varName] = evaluateExpression(varExpr, scriptOptions.variables);
            }
        }

        // Create the markdown-script runtime
        const runtime = new MarkdownScriptRuntime(scriptOptions);
        scriptOptions.globals = {...markdownScriptFunctions};
        scriptOptions.runtime = runtime;
        scriptOptions.runtimeUpdateFn = () => {
            // Did script set the document title?
            if (runtime.documentTitle !== null) {
                this.window.document.title = runtime.documentTitle;
            }

            // Did the script set a timeout?
            this.clearRuntimeCallbacks(false);
            if (runtime.windowTimeout !== null) {
                this.runtimeTimeoutId = this.window.setTimeout(...runtime.windowTimeout);
            }

            // Reset the runtime and render
            const {isDocumentReset, windowLocation} = runtime;
            const documentElements = [
                runtime.resetElements(),
                isDocumentReset ? this.burgerElements() : null
            ];
            renderElements(this.window.document.body, documentElements, isDocumentReset);

            // Focus?
            if (runtime.documentFocus !== null) {
                this.setDocumentFocus(runtime.documentFocus);
            }

            // Navigate?
            // Note: This is done after render since it may have no effect (in which case we want to render).
            if (windowLocation !== null) {
                this.window.location.href = windowLocation;
            }

            // Reset the runtime
            runtime.reset();
        };

        return scriptOptions;
    }


    modifyURL(url, resourceURL) {
        // Hash URL?
        if (url.startsWith('#')) {
            // Fixup the "url" param if its relative
            const hashParams = decodeQueryString(url.slice(1));
            if ('url' in hashParams && hashParams.url !== '' && isRelativeURL(hashParams.url)) {
                hashParams.url = `${getBaseURL(resourceURL)}${hashParams.url}`;
            }

            // Encode hash parameters with a hash ID
            const paramString = encodeQueryString({...this.params, ...hashParams});
            const hashID = getHashID(url);
            return `#${paramString}${hashID !== null && paramString !== '' ? '&' : ''}${hashID !== null ? hashID : ''}`;
        }

        // Relative URL?
        if (isRelativeURL(url)) {
            return `${getBaseURL(resourceURL)}${url}`;
        }

        return url;
    }


    burgerElements() {
        return !this.menu ? null : [
            {
                'html': 'div',
                'attr': {'class': 'menu-burger'},
                'elem': [
                    {
                        'html': 'a',
                        'attr': {'href': this.linkValueToggle('menu', '1'), 'aria-label': 'Menu'},
                        'elem': menuSVGElements
                    }
                ]
            },

            // Popup menu
            !('menu' in this.params) ? null : {
                'html': 'div',
                'attr': {'class': 'menu'},
                'elem': [
                    {
                        'html': 'a',
                        'attr': {'href': this.linkCommandToggle('markdown', '1'), 'aria-label': 'Show Markdown'},
                        'elem': markdownSVGElements
                    },
                    {
                        'html': 'a',
                        'attr': {'href': this.linkCycle('fontSize', this.fontSize, 2), 'aria-label': 'Font size'},
                        'elem': fontSizeSVGElements
                    },
                    {
                        'html': 'a',
                        'attr': {'href': this.linkCycle('lineHeight', this.lineHeight, 0.2, 1), 'aria-label': 'Line height'},
                        'elem': lineHeightSVGElements
                    },
                    {
                        'html': 'a',
                        'attr': {'href': this.linkCommandToggle('help', '1'), 'aria-label': 'Help'},
                        'elem': helpSVGElements
                    }
                ]
            }
        ];
    }


    linkCycle(paramName, defaultValue, delta, fixed = null) {
        const value = paramName in this.params ? this.params[paramName] : defaultValue;
        const {attr} = markdownUpTypes.MarkdownUp.struct.members.find((member) => member.name === paramName);
        let valueNew = value + delta;
        if (valueNew > attr.lte) {
            valueNew = attr.gte;
        }
        valueNew = Math.max(attr.gte, Math.min(attr.lte, valueNew));
        const params = {...this.params};
        params[paramName] = fixed === null ? `${valueNew}` : `${valueNew.toFixed(fixed)}`;
        return `#${encodeQueryString(params)}`;
    }


    linkCommandToggle(command, value) {
        const params = {...this.params};
        if ('cmd' in this.params && command in this.params.cmd) {
            delete params.cmd;
        } else {
            params.cmd = {};
            params.cmd[command] = `${value}`;
        }
        return `#${encodeQueryString(params)}`;
    }


    linkValueToggle(name, value) {
        const params = {...this.params};
        if (!(name in this.params)) {
            params[name] = value;
        } else {
            delete params[name];
        }
        return `#${encodeQueryString(params)}`;
    }
}


// Get a URL's hash ID
function getHashID(url) {
    const matchId = url.match(rHashId);
    return matchId !== null ? matchId[1] : null;
}

const rHashId = /[#&]([^=]+)$/;


// Icon sizes
const burgerSize = '24';
const iconSize = '36';


// "menu" SVG element model
const menuSVGElements = {
    'svg': 'svg',
    'attr': {'width': burgerSize, 'height': burgerSize, 'viewBox': '0 0 24 24'},
    'elem': {
        'svg': 'path',
        'attr': {'d': 'M3,5 L21,5 M3,12 L21,12 M3,19 L21,19', 'stroke': 'black', 'stroke-width': '3', 'fill': 'none'}
    }
};


// Font size cycle SVG element model
const fontSizeSVGElements = {
    'svg': 'svg',
    'attr': {'width': iconSize, 'height': iconSize, 'viewBox': '0 0 24 24'},
    'elem': {
        'svg': 'path',
        'attr': {'d': 'M4,22 L10,2 L14,2 L20,22 M6,14 L18,14', 'stroke': 'black', 'stroke-width': '4', 'fill': 'none'}
    }
};


// Line height cycle SVG element model
const lineHeightSVGElements = {
    'svg': 'svg',
    'attr': {'width': iconSize, 'height': iconSize, 'viewBox': '0 0 24 24'},
    'elem': {
        'svg': 'path',
        'attr': {'d': 'M2,3 L22,3 M2,9 L22,9 M2,15 L22,15 M2,21 L22,21', 'stroke': 'black', 'stroke-width': '2', 'fill': 'none'}
    }
};


// "markdown" SVG element model
const markdownSVGElements = {
    'svg': 'svg',
    'attr': {'width': iconSize, 'height': iconSize, 'viewBox': '0 0 24 24'},
    'elem': [
        {
            'svg': 'path',
            'attr': {'d': 'M4,2 L20,2 L20,22 L4,22 Z', 'stroke': 'black', 'stroke-width': '3', 'fill': 'none'}
        },
        {
            'svg': 'path',
            'attr': {
                'd': 'M7,7.5 L17,7.5 M7,12 L17,12 M7,16.5 L17,16.5',
                'stroke': 'black', 'stroke-width': '2', 'fill': 'none'
            }
        }
    ]
};


// "help" SVG element model
const helpSVGElements = {
    'svg': 'svg',
    'attr': {'width': iconSize, 'height': iconSize, 'viewBox': '0 0 24 24'},
    'elem': {
        'svg': 'path',
        'attr': {'d': 'M7,9 L7,4 L17,4 L17,12 L12,12 L12,16 M12,19 L12,22', 'stroke': 'black', 'stroke-width': '3', 'fill': 'none'}
    }
};
