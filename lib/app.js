// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/app */

import {ElementApplication, encodeHashID, getHashID} from '../element-app/lib/app.js';
import {MarkdownScriptRuntime, markdownScriptCodeBlock} from '../markdown-charts/lib/script.js';
import {decodeQueryString, encodeQueryString} from '../schema-markdown/lib/encode.js';
import {getBaseURL, isRelativeURL, markdownElementsAsync} from '../markdown-model/lib/elements.js';
import {getMarkdownTitle, parseMarkdown} from '../markdown-model/lib/parser.js';
import {UserTypeElements} from '../schema-markdown-doc/lib/userTypeElements.js';
import {barChartCodeBlock} from '../markdown-charts/lib/barChart.js';
import {chartModel} from '../markdown-charts/lib/model.js';
import {computeVariables} from '../markdown-charts/lib/data.js';
import {dataTableCodeBlock} from '../markdown-charts/lib/dataTable.js';
import {lineChartCodeBlock} from '../markdown-charts/lib/lineChart.js';


// The application's hash parameter type model
const markdownUpHashTypes = `\
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
    optional string(len > 0) url

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


# Field value union
union FieldValue

    # A datetime value
    datetime(nullable) datetime

    # A number value
    float(nullable) number

    # A string value
    string(nullable) string


# Application command union
union Command

    # Display the application's hash parameter documentation
    HelpType help

    # Show the URL's Markdown text
    int(== 1) markdown

# Help type enum
enum HelpType
    Help
    Bar
    Line
    Table
`;


/**
 * A markdown-up application options object
 *
 * @typedef {Object} MarkdownUpOptions
 * @param {number} [options.fontSize = 12] - The font size, in points
 * @param {number} [options.lineHeight = 1.2] - The line height, in em
 * @param {boolean} [options.menu = true] - If true, show the menu
 * @param {string} [options.url = 'README.md'] - The resource URL
 */


/**
 * MarkdownUp, a web application for viewing Markdown files
 *
 * The MarkdownUp class extends the element-app
 * [ElementApplication]{@link https://craigahobbs.github.io/element-app/module-lib_app.ElementApplication.html}
 * class.
 *
 * @extends ElementApplication
 * @property {number} fontSize - The font size, in points
 * @property {number} lineHeight - The line height, in em
 * @property {boolean} menu - If true, show the menu
 * @property {string} url - The resource URL
 * @property {number} [setNavigateTimeoutId = null] - The navigate timeout ID
 */
export class MarkdownUp extends ElementApplication {
    /**
     * Create an application instance
     *
     * @param {Object} window - The web browser window object
     * @property {module:lib/app~MarkdownUpOptions} [options] - The markdown-up application options
     */
    constructor(window, {fontSize = 12, lineHeight = 1.2, menu = true, url = 'README.md'} = {}) {
        super(window, 'markdown-up', 'MarkdownUp', markdownUpHashTypes);
        this.fontSize = fontSize;
        this.lineHeight = lineHeight;
        this.menu = menu;
        this.url = url;
        this.setNavigateTimeoutId = null;
    }

    /**
     * ElementApplication.render override to clear the navigate timeout
     */
    async render() {
        // Clear the navigate timeout ID, if one is set
        /* c8 ignore start */
        if (this.setNavigateTimeoutId !== null) {
            this.window.clearTimeout(this.setNavigateTimeoutId);
            this.setNavigateTimeoutId = null;
        }
        // eslint-disable-next lines-around-comment
        /* c8 ignore stop */

        // Call the base class implementation
        await super.render();
    }

    /**
     * The [Element Application pre-render callback]{@link
     * https://craigahobbs.github.io/element-app/module-lib_app.ElementApplication.html#preRender}.
     * The callback is used to set the document font size and line height.
     *
     * @override
     */
    preRender() {
        // Set the font size
        const fontSize = this.params !== null && 'fontSize' in this.params ? this.params.fontSize : this.fontSize;
        this.window.document.documentElement.style.setProperty('--markdown-model-font-size', `${fontSize}pt`);

        // Set the line height
        const lineHeight = this.params !== null && 'lineHeight' in this.params ? this.params.lineHeight : this.lineHeight;
        this.window.document.documentElement.style.setProperty('--markdown-model-line-height', `${lineHeight}em`);
    }

    /**
     * The [Element Application main entry point]{@link
     * https://craigahobbs.github.io/element-app/module-lib_app.ElementApplication.html#main}.
     *
     * @override
     * @returns {Object} [MainResult]{@link https://craigahobbs.github.io/element-app/module-lib_app.html#~MainResult}
     */
    async main() {
        // Load the text resource
        const url = 'url' in this.params ? this.params.url : this.url;
        let markdownText = null;
        let markdownModel = null;
        let markdownTitle = null;
        if (!('cmd' in this.params) || 'markdown' in this.params.cmd) {
            const response = await this.window.fetch(url);
            if (!response.ok) {
                const status = response.statusText;
                throw new Error(`Could not fetch "${url}"${status === '' ? '' : `, ${JSON.stringify(status)}`}`);
            }
            markdownText = await response.text();
            markdownModel = parseMarkdown(markdownText);
            markdownTitle = getMarkdownTitle(markdownModel);
        }

        // Command?
        let cmdElements = null;
        if ('cmd' in this.params) {
            // Display markdown?
            if ('markdown' in this.params.cmd) {
                cmdElements = {'html': 'div', 'attr': {'class': 'markdown'}, 'elem': {'text': markdownText}};

            // Help
            } else if (this.params.cmd.help === 'Bar') {
                cmdElements = new UserTypeElements(this.params).getElements(chartModel.types, `BarChart`);
            } else if (this.params.cmd.help === 'Line') {
                cmdElements = new UserTypeElements(this.params).getElements(chartModel.types, `LineChart`);
            } else if (this.params.cmd.help === 'Table') {
                cmdElements = new UserTypeElements(this.params).getElements(chartModel.types, `DataTable`);
            } else {
                cmdElements = new UserTypeElements(this.params).getElements(this.hashTypes, this.hashType);
            }
        }

        // Helper function to create a cycle link
        const linkCycle = (paramName, defaultValue, delta, fixed = null) => {
            const value = paramName in this.params ? this.params[paramName] : defaultValue;
            const {attr} = this.hashTypes.MarkdownUp.struct.members.find((member) => member.name === paramName);
            let valueNew = value + delta;
            if (valueNew > attr.lte) {
                valueNew = attr.gte;
            }
            valueNew = Math.max(attr.gte, Math.min(attr.lte, valueNew));
            const params = {...this.params};
            params[paramName] = fixed === null ? `${valueNew}` : `${valueNew.toFixed(fixed)}`;
            return `#${encodeQueryString(params)}`;
        };

        // Helper function to create a toggle link
        const linkCommandToggle = (command, value) => {
            const params = {...this.params};
            if ('cmd' in this.params && command in this.params.cmd) {
                delete params.cmd;
            } else {
                params.cmd = {};
                params.cmd[command] = `${value}`;
            }
            return `#${encodeQueryString(params)}`;
        };

        // Helper function to create a value-toggle link
        const linkValueToggle = (name, value) => {
            const params = {...this.params};
            if (!(name in this.params)) {
                params[name] = value;
            } else {
                delete params[name];
            }
            return `#${encodeQueryString(params)}`;
        };

        // The URL modifier function
        const urlFn = (rawURL) => {
            // Hash URL?
            if (rawURL.startsWith('#')) {
                // Fixup the "url" param if its relative
                const hashParams = decodeQueryString(rawURL.slice(1));
                if ('url' in hashParams && isRelativeURL(hashParams.url)) {
                    hashParams.url = `${getBaseURL(url)}${hashParams.url}`;
                }

                // Return the combined hash URL
                return encodeHashID({...this.params, ...hashParams}, getHashID(rawURL));
            }

            // Relative URL?
            if (isRelativeURL(rawURL)) {
                return `${getBaseURL(url)}${rawURL}`;
            }

            return rawURL;
        };

        // The log function
        const logFn = (text) => {
            if ('debug' in this.params) {
                this.window.console.log(text);
            }
        };

        /* c8 ignore start */
        // The fetch function
        // eslint-disable-next-line require-await
        const fetchFn = async (fetchURL, init) => this.window.fetch(urlFn(fetchURL), init);

        // The navigate timeout function
        const navigateTimeoutFn = (navigateURL, delay) => {
            const timeoutCallback = () => {
                this.window.location.href = urlFn(navigateURL);
            };
            this.setNavigateTimeoutId = this.window.setTimeout(timeoutCallback, delay);
        };
        // eslint-disable-next-line lines-around-comment
        /* c8 ignore stop */

        // Render the text as Markdown
        const fontSize = 0.9 * (this.params !== null && 'fontSize' in this.params ? this.params.fontSize : this.fontSize);
        const chartOptions = {
            fetchFn,
            fontSize,
            'localStorage': this.window.localStorage,
            logFn,
            navigateTimeoutFn,
            'sessionStorage': this.window.sessionStorage,
            urlFn,
            'variables': 'var' in this.params ? computeVariables(this.params.var) : {}
        };
        chartOptions.runtime = new MarkdownScriptRuntime(chartOptions);
        const result = {
            'title': markdownTitle,
            'elements': [
                // Command?
                cmdElements !== null ? cmdElements : null,

                // Add a top hash ID, if necessary
                cmdElements !== null || Object.keys(this.params).length === 0
                    ? null : {'html': 'div', 'attr': {'id': encodeQueryString(this.params), 'style': 'display=none'}},

                // Render the markdown
                cmdElements !== null ? null : await markdownElementsAsync(markdownModel, {
                    'codeBlocks': {
                        'bar-chart': (language, lines) => barChartCodeBlock(language, lines, chartOptions),
                        'data-table': (language, lines) => dataTableCodeBlock(language, lines, chartOptions),
                        'line-chart': (language, lines) => lineChartCodeBlock(language, lines, chartOptions),
                        'markdown-script': (language, lines) => markdownScriptCodeBlock(language, lines, chartOptions)
                    },
                    urlFn,
                    'headerIds': true
                }),

                // Popup menu burger
                !this.menu ? null : {
                    'html': 'div',
                    'attr': {'class': 'menu-burger'},
                    'elem': [
                        {
                            'html': 'a',
                            'attr': {'href': linkValueToggle('menu', '1'), 'aria-label': 'Menu'},
                            'elem': menuSVGElements
                        }
                    ]
                },

                // Popup menu
                !this.menu || !('menu' in this.params) ? null : {
                    'html': 'div',
                    'attr': {'class': 'menu'},
                    'elem': [
                        {
                            'html': 'a',
                            'attr': {'href': linkCommandToggle('markdown', 1), 'aria-label': 'Show Markdown'},
                            'elem': markdownSVGElements
                        },
                        {
                            'html': 'a',
                            'attr': {'href': linkCycle('fontSize', this.fontSize, 2), 'aria-label': 'Font size'},
                            'elem': fontSizeSVGElements
                        },
                        {
                            'html': 'a',
                            'attr': {'href': linkCycle('lineHeight', this.lineHeight, 0.2, 1), 'aria-label': 'Line height'},
                            'elem': lineHeightSVGElements
                        },
                        {
                            'html': 'a',
                            'attr': {'href': linkCommandToggle('help', 'Help'), 'aria-label': 'Help'},
                            'elem': helpSVGElements
                        }
                    ]
                }
            ]
        };

        return result;
    }
}


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
