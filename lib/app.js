// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/app */

import {MarkdownScriptRuntime, markdownScriptCodeBlock} from './script.js';
import {decodeQueryString, encodeQueryString} from '../schema-markdown/lib/encode.js';
import {getBaseURL, isRelativeURL, markdownElementsAsync} from '../markdown-model/lib/elements.js';
import {getMarkdownTitle, parseMarkdown} from '../markdown-model/lib/parser.js';
import {SchemaMarkdownParser} from '../schema-markdown/lib/parser.js';
import {barChartCodeBlock} from './barChart.js';
import {dataTableCodeBlock} from './dataTable.js';
import {evaluateExpression} from '../calc-script/lib/runtime.js';
import {lineChartCodeBlock} from './lineChart.js';
import {parseExpression} from '../calc-script/lib/parser.js';
import {renderElements} from '../element-model/lib/elementModel.js';
import {schemaMarkdownDoc} from '../schema-markdown-doc/lib/schemaMarkdownDoc.js';
import {validateType} from '../schema-markdown/lib/schema.js';


// The application's hash parameter type model
const markdownUpTypesSmd = `\
#
# **markdown-up** is a Markdown viewer application. Click the following link to learn more.
#
# [markdown-up](https://github.com/craigahobbs/markdown-up#readme)
#
# ## Hash Parameters
#
# The markdown-up application recognizes the following hash parameters:
#
struct MarkdownUp

    # The resource URL
    optional string url

    # Optional command
    optional Command cmd

    # The menu visibility (default is hidden)
    optional int(== 1) menu

    # The font size
    optional int(>= 8, <= 18) fontSize

    # The line height
    optional int(>= 1, <= 2) lineHeight

    # Variable expressions
    optional string{} var

    # If true, enable debug behavior
    optional int(== 1) debug


# Application command union
union Command

    # Display the application's hash parameter documentation
    int(== 1) help

    # Show the URL's Markdown text
    int(== 1) markdown
`;
const markdownUpTypes = new SchemaMarkdownParser(markdownUpTypesSmd).types;


/**
 * A markdown-up application options object
 *
 * @typedef {Object} MarkdownUpOptions
 * @param {number} [fontSize = 12] - The font size, in points
 * @param {number} [lineHeight = 1.2] - The line height, in em
 * @param {string} [markdownText = null] - The markdown text
 * @param {boolean} [menu = true] - If true, show the menu
 * @param {string} [url = 'README.md'] - The resource URL
 */


/**
 * MarkdownUp, a Markdown viewer
 *
 * @property {Object} window - The web browser window object
 * @property {?Object} params - The validated hash parameters object
 * @property {number} fontSize - The font size, in points
 * @property {number} lineHeight - The line height, in em
 * @property {string} markdownText - The markdown text
 * @property {boolean} menu - If true, show the menu
 * @property {string} url - The resource URL
 * @property {?number} setNavigateTimeoutId - The navigate timeout ID
 */
export class MarkdownUp {
    /**
     * Create an application instance
     *
     * @param {Object} window - The web browser window object
     * @property {module:lib/app~MarkdownUpOptions} [options] - The markdown-up application options
     */
    constructor(window, {fontSize = 12, lineHeight = 1.2, markdownText = null, menu = true, url = 'README.md'} = {}) {
        this.window = window;
        this.params = null;
        this.fontSize = fontSize;
        this.lineHeight = lineHeight;
        this.markdownText = markdownText;
        this.menu = menu;
        this.url = url;
        this.setNavigateTimeoutId = null;
    }


    /**
     * Run the application. This method calls render and subscribes to any hash parameter changes to
     * re-render on any hash parameter change.
     */
    async run() {
        await this.render();
        this.window.addEventListener('hashchange', () => this.render(), false);
    }


    /**
     * ElementApplication.render override to clear the navigate timeout
     */
    async render() {
        // Clear the navigate timeout ID, if one is set
        if (this.setNavigateTimeoutId !== null) {
            this.window.clearTimeout(this.setNavigateTimeoutId);
            this.setNavigateTimeoutId = null;
        }

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

            // Call the application main and validate the result
            result = await this.main();
        } catch ({message}) {
            result = {'elements': {'html': 'p', 'elem': {'text': `Error: ${message}`}}};
            isError = true;
        }

        // Navigate?
        if ('location' in result && result.location !== null) {
            this.window.location.href = result.location;
            return;
        }

        // Set the window title
        const title = result.title ?? null;
        if (title !== null) {
            this.window.document.title = title;
        }

        // Set the font size
        const fontSize = this.params !== null && 'fontSize' in this.params ? this.params.fontSize : this.fontSize;
        this.window.document.documentElement.style.setProperty('--markdown-model-font-size', `${fontSize}pt`);

        // Set the line height
        const lineHeight = this.params !== null && 'lineHeight' in this.params ? this.params.lineHeight : this.lineHeight;
        this.window.document.documentElement.style.setProperty('--markdown-model-line-height', `${lineHeight}em`);

        // Render the element model
        renderElements(this.window.document.body, result.elements);

        // If there is a URL hash ID, re-navigate to go there since it was just rendered. After the
        // first render, re-render is short-circuited by the unchanged hash param check above.
        if (!isError && getHashID(this.window.location.hash) !== null) {
            this.window.location.href = this.window.location.hash;
        }
    }


    /**
     * Parse and validate the hash parameters
     *
     * @param {?string} paramString - Optional parameter string for testing
     */
    updateParams(paramString = null) {
        // Clear, then validate the hash parameters (may throw)
        this.params = null;

        // Decode the params string
        const params = decodeQueryString(paramString !== null ? paramString : this.window.location.hash.slice(1));

        // Validate the params
        this.params = validateType(markdownUpTypes, 'MarkdownUp', params);
    }


    /**
     * The [Element Application main entry point]{@link
     * https://craigahobbs.github.io/element-app/module-lib_app.ElementApplication.html#main}.
     *
     * @override
     * @returns {Object} [MainResult]{@link https://craigahobbs.github.io/element-app/module-lib_app.html#~MainResult}
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
                    'title': 'markdown-up',
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
                        'bar-chart': (language, lines) => barChartCodeBlock(language, lines, scriptOptions),
                        'data-table': (language, lines) => dataTableCodeBlock(language, lines, scriptOptions),
                        'line-chart': (language, lines) => lineChartCodeBlock(language, lines, scriptOptions),
                        'markdown-script': (language, lines) => markdownScriptCodeBlock(language, lines, scriptOptions)
                    },
                    'urlFn': (urlRaw) => this.modifyURL(urlRaw, url),
                    'headerIds': true
                }),

                // Popup menu burger
                this.burgerElements()
            ]
        };

        // Did a script set the document title?
        if (scriptOptions.runtime.documentTitle !== null) {
            result.title = scriptOptions.runtime.documentTitle;
        }

        return result;
    }


    createScriptOptions(resourceURL) {
        // The navigate timeout function
        const navigateTimeoutFn = (navigateURL, delay) => {
            const timeoutCallback = () => {
                this.window.location.href = this.modifyURL(navigateURL, resourceURL);
            };
            this.setNavigateTimeoutId = this.window.setTimeout(timeoutCallback, delay);
        };

        // Create the script options object
        const scriptOptions = {
            // eslint-disable-next-line require-await
            'fetchFn': async (fetchURL, init) => this.window.fetch(this.modifyURL(fetchURL, resourceURL), init),
            'fontSize': 0.9 * (this.params !== null && 'fontSize' in this.params ? this.params.fontSize : this.fontSize),
            'localStorage': this.window.localStorage,
            navigateTimeoutFn,
            'params': this.params,
            'sessionStorage': this.window.sessionStorage,
            'urlFn': (url) => this.modifyURL(url, resourceURL)
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
        scriptOptions.runtime = new MarkdownScriptRuntime(scriptOptions);

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
