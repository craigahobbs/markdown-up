// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {ElementApplication, encodeHashID, getHashID} from '../element-app/lib/app.js';
import {decodeQueryString, encodeQueryString} from '../schema-markdown/index.js';
import {getBaseURL, getMarkdownTitle, isRelativeURL, markdownElements, parseMarkdown} from '../markdown-model/index.js';


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

# Application command union
union Command

    # Render the application's hash parameter documentation
    int(== 1) help

    # Show the URL's Markdown text
    int(== 1) markdown
`;


/**
 * MarkdownUp, a web application for viewing Markdown files.
 *
 * Markdown up is an
 * [Element Application]{@link https://craigahobbs.github.io/element-app/module-lib_app.ElementApplication.html}.
 *
 * @extends ElementApplication
 * @property {number} fontSize - The font size, in points
 * @property {number} lineHeight - The line height, in em
 * @property {boolean} menu - If true, show the menu
 * @property {string} url - The resource URL
 */
export class MarkdownUp extends ElementApplication {
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
        super(window, 'markdown-up', 'MarkdownUp', markdownUpHashTypes);
        this.fontSize = fontSize;
        this.lineHeight = lineHeight;
        this.menu = menu;
        this.url = url;
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
     * https://craigahobbs.github.io/element-app/module-lib_app.ElementApplication.html#helpElements}.
     *
     * @override
     * @returns {Object} [MainResult]{@link https://craigahobbs.github.io/element-app/module-lib_app.html#~MainResult}
     */
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

        // Render the text as Markdown
        return {
            'title': markdownTitle,
            'elements': [
                // Application hash parameter help?
                !('cmd' in this.params && 'help' in this.params.cmd)
                    ? null : this.helpElements(),

                // Render markdown?
                !('cmd' in this.params && 'markdown' in this.params.cmd)
                    ? null : {'html': 'div', 'attr': {'class': 'markdown'}, 'elem': {'text': text}},

                // Add a top hash ID, if necessary
                'cmd' in this.params || Object.keys(this.params).length === 0
                    ? null : {'html': 'div', 'attr': {'id': encodeQueryString(this.params), 'style': 'display=none'}},

                // Render the markdown
                'cmd' in this.params ? null : markdownElements(markdownModel, {
                    'hashFn': (hashURL) => {
                        // Decode the hash params
                        const hashParams = decodeQueryString(hashURL.slice(1));

                        // Fixup the "url" param if its relative
                        if ('url' in hashParams && isRelativeURL(hashParams.url)) {
                            hashParams.url = `${getBaseURL(url)}${hashParams.url}`;
                        }

                        // Return the combined hash URL
                        return encodeHashID({...this.params, ...hashParams}, getHashID(hashURL));
                    },
                    'headerIds': true,
                    url
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
                            'attr': {'href': linkCommandToggle('help', 1), 'aria-label': 'Help'},
                            'elem': helpSVGElements
                        }
                    ]
                }
            ]
        };
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