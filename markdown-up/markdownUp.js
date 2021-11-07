// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import * as smd from '../schema-markdown/index.js';
import {barChartCodeBlock, chartModel, dataTableCodeBlock, lineChartCodeBlock} from './markdown-charts/index.js';
import {getMarkdownTitle, markdownElements, parseMarkdown} from '../markdown-model/index.js';
import {UserTypeElements} from '../schema-markdown-doc/index.js';
import {encodeQueryString} from '../schema-markdown/index.js';
import {renderElements} from '../element-model/index.js';


// The application's hash parameter type model
const appHashTypes = (new smd.SchemaMarkdownParser(`\
#
# **markdown-up** is a Markdown viewer application. Click the following link to learn more.
#
# [markdown-up](https://github.com/craigahobbs/markdown-up#readme)
#
# ## markdown-charts
#
# [bar-chart](#cmd.help=Bar)
#
# [data-table](#cmd.help=Table)
#
# [line-chart](#cmd.help=Line)
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

    # Variable collection
    optional FieldValue{len > 0} variables


# Field value union
union FieldValue

    # A datetime value
    datetime datetime

    # A number value
    float number

    # A string value
    string string


# Application command union
union Command

    # Render the application's hash parameter documentation
    HelpType help

    # Show the URL's Markdown text
    int(== 1) markdown


# Help type enum
enum HelpType
    Help
    Bar
    Line
    Table
`).types);


/**
 * The MarkdownUp application
 *
 * @property {Object} window - The web browser window object
 * @property {number} fontSize - The font size, in points
 * @property {number} lineHeight - The line height, in em
 * @property {boolean} menu - If true, show the menu
 * @property {string} url - The resource URL
 * @property {Object} params - The validated hash parameters object
 */
export class MarkdownUp {
    /**
     * Create an application instance
     *
     * @param {Object} window - The web browser window object
     * @param {Object} [options] - The application options
     * @param {number} [options.fontSize = 12] - The font size, in points
     * @param {number} [options.lineHeight = 1.2] - The line height, in em
     * @param {boolean} [options.menu = true] - If true, show the menu
     * @param {string} [options.url = 'README.md'] - The resource URL
     */
    constructor(window, {
        fontSize = 12,
        lineHeight = 1.2,
        menu = true,
        url = 'README.md'
    } = {}) {
        this.window = window;
        this.fontSize = fontSize;
        this.lineHeight = lineHeight;
        this.menu = menu;
        this.url = url;
        this.params = null;
    }

    /**
     * Run the application
     *
     * @param {Object} window - The web browser window object
     * @param {Object} [options = {}] - The application options
     * @returns {MarkdownUp}
     */
    static async run(window, options = {}) {
        const app = new MarkdownUp(window, options);
        await app.render();
        window.addEventListener('hashchange', () => app.render(), false);
        return app;
    }

    // Helper function to parse and validate the hash parameters
    updateParams(paramStr = null) {
        // Clear, then validate the hash parameters (may throw)
        this.params = null;

        // Decode the params string
        const paramStrActual = paramStr !== null ? paramStr : this.window.location.hash.substring(1);
        const params = smd.decodeQueryString(paramStrActual);

        // Validate the params
        this.params = smd.validateType(appHashTypes, 'MarkdownUp', params);
    }

    // Render the application
    async render() {
        let result;
        try {
            // Validate hash parameters
            const paramsPrev = this.params;
            this.updateParams();

            // Skip the render if the page params haven't changed
            if (paramsPrev !== null && JSON.stringify(paramsPrev) === JSON.stringify(this.params)) {
                return;
            }

            // Render the application elements
            result = await this.main();
        } catch ({message}) {
            result = {'elements': {'html': 'p', 'elem': {'text': `Error: ${message}`}}};
        }

        // Set the font size
        const fontSize = this.params !== null && 'fontSize' in this.params ? this.params.fontSize : this.fontSize;
        this.window.document.documentElement.style.setProperty('--markdown-model-font-size', `${fontSize}pt`);

        // Set the line height
        const lineHeight = this.params !== null && 'lineHeight' in this.params ? this.params.lineHeight : this.lineHeight;
        this.window.document.documentElement.style.setProperty('--markdown-model-line-height', `${lineHeight}em`);

        // Render the application
        this.window.document.title = 'title' in result ? result.title : 'MarkdownUp';
        renderElements(this.window.document.body, result.elements);
    }

    // Generate the application's element model
    async main() {
        // Load the text resource
        const url = 'url' in this.params ? this.params.url : this.url;
        let text = null;
        let markdownModel = null;
        let markdownTitle = null;
        if (!('cmd' in this.params) || 'markdown' in this.params.cmd) {
            const response = await this.window.fetch(url);
            if (!response.ok) {
                const status = response.statusText;
                throw new Error(`Could not fetch "${url}"${status === '' ? '' : `, ${JSON.stringify(status)}`}`);
            }
            text = await response.text();
            markdownModel = parseMarkdown(text);
            markdownTitle = getMarkdownTitle(markdownModel);
        }

        // Helper function to create a cycle link
        const linkCycle = (paramName, defaultValue, delta, fixed = null) => {
            const value = paramName in this.params ? this.params[paramName] : defaultValue;
            const {attr} = appHashTypes.MarkdownUp.struct.members.find((member) => member.name === paramName);
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

        // Render the text as Markdown
        const chartOptions = {
            'fontSize': 0.9 * (this.params !== null && 'fontSize' in this.params ? this.params.fontSize : this.fontSize),
            url,
            'variables': 'variables' in this.params ? this.params.variables : {},
            'window': this.window
        };
        const result = {
            'elements': [
                !('cmd' in this.params && 'help' in this.params.cmd && this.params.cmd.help === 'Help')
                    ? null : (new UserTypeElements(this.params)).getElements(appHashTypes, 'MarkdownUp'),
                !('cmd' in this.params && 'help' in this.params.cmd && this.params.cmd.help === 'Bar')
                    ? null : (new UserTypeElements(this.params)).getElements(chartModel.types, 'BarChart'),
                !('cmd' in this.params && 'help' in this.params.cmd && this.params.cmd.help === 'Line')
                    ? null : (new UserTypeElements(this.params)).getElements(chartModel.types, 'LineChart'),
                !('cmd' in this.params && 'help' in this.params.cmd && this.params.cmd.help === 'Table')
                    ? null : (new UserTypeElements(this.params)).getElements(chartModel.types, 'DataTable'),
                !('cmd' in this.params && 'markdown' in this.params.cmd)
                    ? null : {'html': 'div', 'attr': {'class': 'markdown'}, 'elem': {'text': text}},
                'cmd' in this.params ? null : markdownElements(markdownModel, {
                    'hashPrefix': smd.encodeQueryString(this.params),
                    'headerIds': true,
                    url,
                    'codeBlocks': {
                        'bar-chart': (language, lines) => barChartCodeBlock(language, lines, chartOptions),
                        'data-table': (language, lines) => dataTableCodeBlock(language, lines, chartOptions),
                        'line-chart': (language, lines) => lineChartCodeBlock(language, lines, chartOptions)
                    }
                }),
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
                !this.menu || !('menu' in this.params) ? null : {
                    'html': 'div',
                    'attr': {'class': 'menu'},
                    'elem': [
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
                            'attr': {'href': linkCommandToggle('markdown', 1), 'aria-label': 'Show Markdown'},
                            'elem': markdownSVGElements
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
        if (markdownTitle !== null) {
            result.title = markdownTitle;
        }
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
