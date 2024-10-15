// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/app */

import {MarkdownScriptRuntime, markdownScriptCodeBlock} from './script.js';
import {decodeQueryString, encodeQueryString, jsonStringifySortKeys} from '../schema-markdown/lib/encode.js';
import {getMarkdownTitle, parseMarkdown} from '../markdown-model/lib/parser.js';
import {evaluateExpression} from '../bare-script/lib/runtime.js';
import {markdownElementsAsync} from '../markdown-model/lib/elements.js';
import {markdownScriptFunctions} from './scriptLibrary.js';
import {parseExpression} from '../bare-script/lib/parser.js';
import {parseSchemaMarkdown} from '../schema-markdown/lib/parser.js';
import {renderElements} from '../element-model/lib/elementModel.js';
import {schemaMarkdownDoc} from '../schema-markdown-doc/lib/schemaMarkdownDoc.js';
import {validateType} from '../schema-markdown/lib/schema.js';


// The application's hash parameter type model
const markdownUpTypes = parseSchemaMarkdown(`\
#
# [MarkdownUp](https://github.com/craigahobbs/markdown-up#readme) is a Markdown viewer.
#
# ## Hash Parameters
#
# MarkdownUp recognizes the following hash parameters:
#
struct MarkdownUp

    # The resource URL
    optional string url

    # Variable expressions
    optional string{} var

    # Optional command
    optional MarkdownUpView view


# The MarkdownUp local storage JSON schema
struct MarkdownUpLocal

    # If set, dark mode is enabled
    optional bool darkMode

    # The font size
    optional int(>= 8, <= 18) fontSize

    # The line height
    optional float(>= 1, <= 2) lineHeight


# The MarkdownUp session storage JSON schema
struct MarkdownUpSession

    # If set, the menu is expanded (default is collapsed)
    optional int(== 1) menu

    # If set, enable debug behavior
    optional int(== 1) debug


# A MarkdownUp application view
enum MarkdownUpView

    # Display the hash parameters documentation
    help

    # Show the resource's Markdown text
    markdown
`);


/**
 * The MarkdownUp application options
 *
 * @typedef {Object} MarkdownUpOptions
 * @property {?boolean} [darkMode = false] - If true, use dark mode by default
 * @property {?number} [fontSize = 12] - The font size, in points
 * @property {?Object} [globals = null] - Global script runtime variables
 * @property {?number} [lineHeight = 1.2] - The line height, in em
 * @property {?string} [markdownText = null] - The default Markdown text
 * @property {?boolean} [menu = true] - If true, show the menu
 * @property {?string} [systemPrefix] - The markdown-script system include prefix
 * @property {?string} [url = 'README.md'] - The default resource URL
 */


/**
 * The MarkdownUp application
 */
export class MarkdownUp {
    /**
     * Create an application instance
     *
     * @param {Object} window - The web browser window object
     * @param {Object} [options] - The [application options]{@link module:lib/app~MarkdownUpOptions}
     */
    constructor(window, options = null) {
        this.window = window;
        this.params = null;
        this.paramsLocal = null;
        this.paramsSession = null;
        this.darkMode = (options !== null ? options.darkMode : null) ??
            (this.window.matchMedia && this.window.matchMedia('(prefers-color-scheme: dark)').matches);
        this.fontSize = (options !== null ? options.fontSize : null) ?? 12;
        this.globals = (options !== null ? options.globals : null) ?? null;
        this.lineHeight = (options !== null ? options.lineHeight : null) ?? 1.2;
        this.markdownText = (options !== null ? options.markdownText : null) ?? null;
        this.menu = (options !== null ? options.menu : null) ?? true;
        this.systemPrefix = (options !== null ? options.systemPrefix : null) ?? 'https://craigahobbs.github.io/markdown-up/include/';
        this.url = (options !== null ? options.url : null) ?? 'README.md';
        this.runtimeWindowResize = null;
        this.runtimeTimeoutId = null;
    }


    /**
     * Run the application
     */
    async run() {
        await this.render();
        this.window.addEventListener('hashchange', () => this.render(), false);
    }


    async render(forceRender = false) {
        // Parse the hash parameters and render the application element model
        let result;
        let isError = false;
        try {
            // Validate hash parameters
            const paramsPrev = this.params;
            this.updateParams();

            // Skip the render if the page params haven't changed
            if (!forceRender && paramsPrev !== null && jsonStringifySortKeys(paramsPrev) === jsonStringifySortKeys(this.params)) {
                return;
            }
        } catch ({message}) {
            result = {
                'title': 'MarkdownUp',
                'elements': {'html': 'p', 'elem': {'text': `Error: ${message}`}}
            };
            isError = true;
        }

        // Set the colors
        const isDarkMode = this.paramsLocal.darkMode ?? this.darkMode;
        this.window.document.documentElement.style.setProperty('--markdown-model-dark-mode', isDarkMode ? '1' : '0');

        // Set the font size
        const fontSize = this.paramsLocal.fontSize ?? this.fontSize;
        this.window.document.documentElement.style.setProperty('--markdown-model-font-size', `${fontSize}pt`);

        // Set the line height
        const lineHeight = this.paramsLocal.lineHeight ?? this.lineHeight;
        this.window.document.documentElement.style.setProperty('--markdown-model-line-height', `${lineHeight}em`);

        // Call the application main and validate the result
        this.clearRuntimeCallbacks();
        if (!isError) {
            result = await this.main();
        }

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

        // Navigate?
        // Note: This is done after render since it may have no effect (in which case we need to render)
        if ('location' in result && result.location !== null) {
            this.window.location.href = result.location;

        // If there is a header ID, re-navigate to scroll to the header ID since it was just rendered.
        // The re-render is short-circuited by the unchanged hash param check above.
        } else if (!isError && getHeaderId(this.window.location.hash) !== null) {
            this.window.location.href = this.window.location.hash;
        }

        // Focus?
        if ('focus' in result) {
            this.setDocumentFocus(result.focus);
        }
    }


    updateParams(paramString = null, localJSONString = null, sessionJSONString = null) {
        // Clear, then validate the hash parameters (may throw)
        this.params = null;
        this.paramsLocal = {};
        this.paramsSession = {};

        // Decode and validate the hash parameters
        this.params = validateType(
            markdownUpTypes,
            'MarkdownUp',
            decodeQueryString(paramString ?? this.window.location.hash.slice(1))
        );

        // Decode and validate the local storage paramters
        const localJSON = localJSONString ?? this.window.localStorage.getItem('MarkdownUp');
        if (localJSON !== null) {
            try {
                this.paramsLocal = validateType(markdownUpTypes, 'MarkdownUpLocal', JSON.parse(localJSON));
            } catch {
                // Do nothing
            }
        }

        // Decode and validate the session storage parameters
        const sessionJSON = sessionJSONString ?? this.window.sessionStorage.getItem('MarkdownUp');
        if (sessionJSON !== null) {
            try {
                this.paramsSession = validateType(markdownUpTypes, 'MarkdownUpSession', JSON.parse(sessionJSON));
            } catch {
                // Do nothing
            }
        }
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


    async main() {
        const url = this.getResourceURL();
        const scriptOptions = this.createScriptOptions();

        // Help?
        if (this.params.view === 'help') {
            const schemaMarkdownDocOptions = {
                'params': encodeQueryString(this.params),
                'markdownOptions': scriptOptions.markdownOptions
            };
            return {
                'title': 'MarkdownUp',
                'elements': [
                    this.burgerElements(),
                    schemaMarkdownDoc(markdownUpTypes, 'MarkdownUp', schemaMarkdownDocOptions)
                ]
            };
        }

        // Get the Markdown text
        let markdownText;
        let timeBegin;
        if (this.markdownText !== null && !('url' in this.params && this.params.url !== '')) {
            ({markdownText} = this);

            // Log Markdown render begin
            if (scriptOptions.debug) {
                timeBegin = performance.now();
                scriptOptions.logFn('MarkdownUp: ===== Rendering Markdown text');
            }
        } else {
            // Log Markdown render begin
            if (scriptOptions.debug) {
                scriptOptions.logFn(`MarkdownUp: ===== Rendering Markdown document "${url}"`);
            }

            // Log Markdown fetch begin
            let fetchBegin;
            if (scriptOptions.debug) {
                fetchBegin = performance.now();
                scriptOptions.logFn(`MarkdownUp: Fetching "${url}" ...`);
            }

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

            // Log Markdown fetch end with timing
            if (scriptOptions.debug) {
                const fetchEnd = performance.now();
                timeBegin = performance.now();
                scriptOptions.logFn(`MarkdownUp: Fetch completed in ${(fetchEnd - fetchBegin).toFixed(1)} milliseconds`);
            }
        }

        // Parse the Markdown and get the title
        const markdownModel = parseMarkdown(markdownText);
        const markdownTitle = getMarkdownTitle(markdownModel);

        // Display the Markdown?
        if (this.params.view === 'markdown') {
            return {
                'title': markdownTitle,
                'elements': [
                    this.burgerElements(),
                    {'html': 'div', 'attr': {'class': 'markdown'}, 'elem': {'text': markdownText}}
                ]
            };
        }

        // Copy the markdown options and override the markdown-script code block renderer
        const scriptMarkdownOptions = {...scriptOptions.markdownOptions};
        scriptMarkdownOptions.codeBlocks = {...scriptMarkdownOptions.codeBlocks};
        scriptMarkdownOptions.codeBlocks['markdown-script'] =
            (codeBlock, _options) => markdownScriptCodeBlock(codeBlock, scriptOptions);

        // Render the Markdown
        const result = {
            'title': markdownTitle,
            'elements': [
                // Menu "burger"
                this.burgerElements(),

                // Render the markdown
                await markdownElementsAsync(markdownModel, scriptMarkdownOptions)
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

        // Log Markdown render end
        if (scriptOptions.debug) {
            const timeEnd = performance.now();
            scriptOptions.logFn(`MarkdownUp: Markdown rendered in ${(timeEnd - timeBegin).toFixed(1)} milliseconds`);
        }

        return result;
    }


    getResourceURL() {
        if ('url' in this.params && this.params.url !== '') {
            return this.params.url;
        }
        return this.url;
    }


    createScriptOptions() {
        // Create the markdown options object
        const urlFn = (url) => this.modifyURL(url);
        const markdownOptions = {
            'codeBlocks': {},
            urlFn,
            'headerIds': true,
            'usedHeaderIds': new Set()
        };
        if (this.window.navigator.clipboard) {
            markdownOptions.copyFn = (text) => this.window.navigator.clipboard.writeText(text);
        }

        // Create the script options object
        const logFn = (text) => {
            this.window.console.log(text);
        };
        const scriptOptions = {
            'debug': 'debug' in this.paramsSession,
            // eslint-disable-next-line require-await
            'fetchFn': async (fetchURL, options) => this.window.fetch(fetchURL, options),
            'fontSize': this.paramsLocal.fontSize ?? this.fontSize,
            logFn,
            markdownOptions,
            'params': this.params,
            'systemPrefix': this.systemPrefix,
            urlFn,
            'window': this.window
        };

        // Add hash parameter variables, if any
        if ('var' in this.params) {
            scriptOptions.variables = {};
            for (const varName of Object.keys(this.params.var)) {
                const varExprStr = this.params.var[varName];
                try {
                    scriptOptions.variables[varName] = evaluateExpression(parseExpression(varExprStr), scriptOptions.variables);
                } catch ({message}) {
                    if (scriptOptions.debug) {
                        logFn(`MarkdownUp: Error evaluating variable "${varName}" expression "${varExprStr}": ${message}`);
                    }
                }
            }
        }

        // Create the markdown-script runtime
        const runtime = new MarkdownScriptRuntime(scriptOptions);
        scriptOptions.globals = {...markdownScriptFunctions};
        if (this.globals !== null) {
            Object.assign(scriptOptions.globals, this.globals);
        }
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
            const elements = runtime.resetElements();
            if (elements !== null) {
                const {body} = this.window.document;
                if (runtime.documentReset === null) {
                    renderElements(body, [this.burgerElements(), elements]);
                } else {
                    while (body.lastChild !== null && body.lastChild.id !== runtime.documentReset) {
                        body.lastChild.remove();
                    }
                    renderElements(body, [elements], false);
                }
            }

            // Navigate?
            // Note: This is done after render since it may have no effect (in which case we want to render).
            if (runtime.windowLocation !== null) {
                this.window.location.href = runtime.windowLocation;
            }

            // Focus?
            if (runtime.documentFocus !== null) {
                this.setDocumentFocus(runtime.documentFocus);
            }

            // Reset the runtime
            runtime.reset();
        };

        return scriptOptions;
    }


    modifyURL(url) {
        const resourceURL = this.getResourceURL();

        // Hash URL?
        if (url.startsWith('#')) {
            // Fixup the "url" param if its relative
            const hashParams = decodeQueryString(url.slice(1));
            if ('url' in hashParams && hashParams.url !== '' && isRelativeURL(hashParams.url)) {
                hashParams.url = `${getBaseURL(resourceURL)}${hashParams.url}`;
            }

            // Encode hash parameters with a header ID
            const paramString = encodeQueryString({...this.params, ...hashParams});
            const headerId = getHeaderId(url);
            return `#${paramString}${headerId !== null && paramString !== '' ? '&' : ''}${headerId !== null ? headerId : ''}`;
        }

        // Relative URL?
        if (isRelativeURL(url)) {
            return `${getBaseURL(resourceURL)}${url}`;
        }

        return url;
    }


    burgerElements() {
        const paramString = encodeQueryString(this.params);
        const topHeaderId = `${paramString}${paramString !== '' ? '&' : ''}_top`;
        return [
            !this.menu ? null : [
                {
                    'html': 'div',
                    'attr': {'class': 'menu-burger'},
                    'elem': this.menuValueToggle('menu', {
                        'size': 32,
                        'noCheck': true,
                        'path': 'M3,5 L21,5 M3,12 L21,12 M3,19 L21,19'
                    })
                },

                // Popup menu
                !('menu' in this.paramsSession) ? null : {
                    'html': 'div',
                    'attr': {'class': 'menu'},
                    'elem': [
                        this.menuViewToggle('markdown', {
                            'path': 'M4,2 L20,2 L20,22 L4,22 Z',
                            'path2': 'M7,7.5 L17,7.5 M7,12 L17,12 M7,16.5 L17,16.5'
                        }),
                        this.menuDarkModeToggle({
                            'path': 'M16,3 A10,10,0,1,1,3,18 A14,14,0,0,0,17,3'
                        }),
                        this.menuValueCycle('fontSize', this.fontSize, 2, {
                            'path': 'M4,22 L10,2 L14,2 L20,22 M6,14 L18,14',
                            'strokeWidth': 4
                        }),
                        this.menuValueCycle('lineHeight', this.lineHeight, 0.2, {
                            'path2': 'M2,3 L22,3 M2,9 L22,9 M2,15 L22,15 M2,21 L22,21'
                        }),
                        this.menuValueToggle('debug', {
                            'path': 'M12,5 A4,7,0,1,0,12,19 A4,7,0,1,0,12,5 M9,9 L15,9 M9,9 L4,6 M9,12 L3,12 M9,15 L4,18 ' +
                                'M15,9 L20,6 M15,12 L21,12 M15,15 L20,18'
                        }),
                        this.menuViewToggle('help', {
                            'path': 'M7,9 L7,4 L17,4 L17,12 L12,12 L12,16 M12,19 L12,22'
                        })
                    ]
                }
            ],

            // The top header ID
            {'html': 'div', 'attr': {'id': topHeaderId, 'style': 'display=none; position: absolute; top: 0;'}}
        ];
    }


    menuValueToggle(valueName, icon) {
        icon.checked = valueName in this.paramsSession;
        return this.menuButton(
            () => {
                if (valueName in this.paramsSession) {
                    delete this.paramsSession[valueName];
                } else {
                    this.paramsSession[valueName] = 1;
                }
                this.window.sessionStorage.setItem('MarkdownUp', JSON.stringify(this.paramsSession));
                this.render(true);
            },
            icon
        );
    }


    menuViewToggle(viewValue, icon) {
        icon.checked = this.params.view === viewValue;
        return this.menuButton(
            () => {
                const params = {...this.params};
                if (params.view === viewValue) {
                    delete params.view;
                } else {
                    params.view = viewValue;
                }
                this.window.location.href = `#${encodeQueryString(params)}`;
            },
            icon
        );
    }


    menuDarkModeToggle(icon) {
        const isDarkMode = this.paramsLocal.darkMode ?? this.darkMode;
        icon.checked = isDarkMode;
        return this.menuButton(
            () => {
                if (isDarkMode !== this.darkMode) {
                    delete this.paramsLocal.darkMode;
                } else {
                    this.paramsLocal.darkMode = !isDarkMode;
                }
                this.window.localStorage.setItem('MarkdownUp', JSON.stringify(this.paramsLocal));
                this.render(true);
            },
            icon
        );
    }


    menuValueCycle(valueName, valueDefault, valueDelta, icon) {
        return this.menuButton(
            () => {
                const {attr} = markdownUpTypes.MarkdownUpLocal.struct.members.find((member) => member.name === valueName);
                let valueNew = (this.paramsLocal[valueName] ?? valueDefault) + valueDelta;
                if (valueNew > attr.lte) {
                    valueNew = attr.gte;
                }
                this.paramsLocal[valueName] = valueNew;
                this.window.localStorage.setItem('MarkdownUp', JSON.stringify(this.paramsLocal));
                this.render(true);
            },
            icon
        );
    }


    menuButton(onClick, {checked = false, noCheck = false, path = null, path2 = null, strokeWidth = 3, size = 48}) {
        const isDarkMode = this.paramsLocal.darkMode ?? this.darkMode;
        const stroke = (isDarkMode ? (checked && !noCheck ? 'black' : 'white') : (checked && !noCheck ? 'white' : 'black'));
        const borderSize = (0.125 * size).toFixed(3);
        const innerSize = (0.75 * size).toFixed(3);
        return {
            'html': 'div',
            'attr': {'style': 'cursor: pointer; user-select: none;'},
            'elem': {
                'svg': 'svg',
                'attr': {'width': size, 'height': size},
                'elem': [
                    !checked || noCheck ? null : {
                        'svg': 'rect',
                        'attr': {'fill': (isDarkMode ? 'white' : 'black'), 'stroke': 'none', 'width': size, 'height': size}
                    },
                    {
                        'svg': 'g',
                        'attr': {'transform': `translate(${borderSize}, ${borderSize})`},
                        'elem': {
                            'svg': 'svg',
                            'attr': {'width': innerSize, 'height': innerSize, 'viewBox': '0 0 24 24'},
                            'elem': [
                                path === null ? null : {
                                    'svg': 'path',
                                    'attr': {'fill': 'none', 'stroke': stroke, 'stroke-width': strokeWidth, 'd': path}
                                },
                                path2 === null ? null : {
                                    'svg': 'path',
                                    'attr': {'fill': 'none', 'stroke': stroke, 'stroke-width': strokeWidth - 1, 'd': path2}
                                }
                            ]
                        }
                    }
                ]
            },
            'callback': (element) => {
                element.addEventListener('click', onClick);
            }
        };
    }
}


// Get a URL's header ID
function getHeaderId(url) {
    const matchId = url.match(rHeaderId);
    return matchId !== null ? matchId[1] : null;
}

const rHeaderId = /[#&]([^=]+)$/;


// Test if a URL is relative
function isRelativeURL(url) {
    return !rNotRelativeURL.test(url);
}

const rNotRelativeURL = /^(?:[a-z]+:|\/|\?|#)/;


// Get a URL's base URL
function getBaseURL(url) {
    return url.slice(0, url.lastIndexOf('/') + 1);
}
