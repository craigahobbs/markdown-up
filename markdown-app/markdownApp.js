// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-app/blob/main/LICENSE

import {SchemaMarkdownParser, UserTypeElements, decodeQueryString, validateType} from '../schema-markdown/index.js';
import {markdownElements, parseMarkdown} from '../markdown-model/index.js';
import {renderElements} from '../element-model/index.js';


// The Markdown application's hash parameter type model
const markdownAppTypes = (new SchemaMarkdownParser(`\
# The Markdown application hash parameters struct
struct MarkdownApp

    # The Markdown resource URL
    optional string(len > 0) url

    # Optional application command
    optional Command cmd

# Application command union
union Command

    # Render the application's hash parameter struct documentation
    int(==1) help
`).types);


/**
 * The Markdown application
 *
 * @property {Object} window - The web browser window object
 * @property {string} defaultMarkdownURL - The default Markdown resource URL
 * @property {Array} windowHashChangeArgs - The arguments for the window.addEventListener for "hashchange"
 * @property {Object} params - The validated hash parameters object
 */
export class MarkdownApp {
    /**
     * Create a Markdown application instance
     *
     * @property {Object} window - The web browser window object
     * @property {string} defaultMarkdownURL - The default Markdown resource URL
     */
    constructor(window, defaultMarkdownURL) {
        this.window = window;
        this.defaultMarkdownURL = defaultMarkdownURL;
        this.windowHashChangeArgs = null;
        this.params = null;
    }

    /**
     * Run the Markdown application
     *
     * @property {Object} window - The web browser window object
     * @property {string} defaultMarkdownURL - The default Markdown resource URL
     * @returns {MarkdownApp}
     */
    static run(window, defaultMarkdownURL) {
        const app = new MarkdownApp(window, defaultMarkdownURL);
        app.init();
        app.render();
        return app;
    }

    // Initialize the global application state
    init() {
        this.windowHashChangeArgs = ['hashchange', () => this.render(), false];
        this.window.addEventListener(...this.windowHashChangeArgs);
    }

    // Uninitialize the global application state
    uninit() {
        if (this.windowHashChangeArgs !== null) {
            this.window.removeEventListener(...this.windowHashChangeArgs);
            this.windowHashChangeArgs = null;
        }
    }

    // Helper function to parse and validate the hash parameters
    updateParams(paramStr = null) {
        // Clear, then validate the hash parameters (may throw)
        this.params = null;

        // Decode the params string
        const paramStrActual = paramStr !== null ? paramStr : this.window.location.hash.substring(1);
        const params = decodeQueryString(paramStrActual);

        // Validate the params
        this.params = validateType(markdownAppTypes, 'MarkdownApp', params);
    }

    // Render the Markdown application
    async render() {
        // Validate hash parameters
        try {
            const paramsPrev = this.params;
            this.updateParams();

            // Skip the render if the page params haven't changed
            if (paramsPrev !== null && JSON.stringify(paramsPrev) === JSON.stringify(this.params)) {
                return;
            }
        } catch ({message}) {
            this.renderErrorPage(message);
            return;
        }

        // Clear the page
        this.window.document.title = 'MarkdownApp';
        renderElements(this.window.document.body);

        // Type model URL provided?
        if ('cmd' in this.params) {
            // 'help' in this.params.cmd
            const helpElements = (new UserTypeElements(this.params)).getElements(markdownAppTypes, 'MarkdownApp');
            renderElements(this.window.document.body, helpElements);
        } else {
            // Load the Markdown resource
            const markdownURL = 'url' in this.params ? this.params.url : this.defaultMarkdownURL;
            const response = await this.window.fetch(markdownURL);
            const markdownText = await response.text();

            // Render the Markdown
            const markdownModel = parseMarkdown(markdownText);
            const markdownElem = markdownElements(markdownModel, markdownURL);
            renderElements(this.window.document.body, markdownElem);

            // Set the Markdown title, if any
            const markdownTitle = MarkdownApp.getMarkdownTitle(markdownModel);
            if (markdownTitle !== null) {
                this.window.document.title = markdownTitle;
            }
        }
    }

    /**
     * Get a Markdown model's title. Returns null if no title is found.
     *
     * @param {Object} markdownModel - The markdown model
     * @returns {?string}
     */
    static getMarkdownTitle(markdownModel) {
        for (const part of markdownModel.parts) {
            if ('paragraph' in part && 'style' in part.paragraph) {
                return part.paragraph.spans.map((span) => ('text' in span ? span.text : '')).join('');
            }
        }
        return null;
    }
}
