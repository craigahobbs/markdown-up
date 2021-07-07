// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import * as smd from 'schema-markdown/index.js';
import {getMarkdownTitle, markdownElements, parseMarkdown} from 'markdown-model/index.js';
import {UserTypeElements} from 'schema-markdown-doc/index.js';
import {renderElements} from 'element-model/index.js';


// The application's hash parameter type model
const appHashTypes = (new smd.SchemaMarkdownParser(`\
# The MarkdownUp application hash parameters struct
struct MarkdownUp

    # The resource URL
    optional string(len > 0) url

    # Optional command
    optional Command cmd

# Application command union
union Command

    # Render the application's hash parameter documentation
    int(==1) help
`).types);


/**
 * The MarkdownUp application
 *
 * @property {Object} window - The web browser window object
 * @property {string} defaultURL - The default resource URL
 * @property {Object} params - The validated hash parameters object
 */
export class MarkdownUp {
    /**
     * Create an application instance
     *
     * @property {Object} window - The web browser window object
     * @property {string} defaultURL - The default resource URL
     */
    constructor(window, defaultURL) {
        this.window = window;
        this.defaultURL = defaultURL;
        this.params = null;
    }

    /**
     * Run the application
     *
     * @property {Object} window - The web browser window object
     * @property {string} [defaultURL='README.md'] - The default resource URL
     * @returns {MarkdownUp}
     */
    static async run(window, defaultURL = 'README.md') {
        const app = new MarkdownUp(window, defaultURL);
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

    // Render the Markdown application
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

        // Render the application
        this.window.document.title = 'title' in result ? result.title : 'MarkdownUp';
        renderElements(this.window.document.body, result.elements);
    }

    // Generate the Markdown application's element model
    async main() {
        // Application command?
        if ('cmd' in this.params) {
            // 'help' in this.params.cmd
            return {'elements': (new UserTypeElements(this.params)).getElements(appHashTypes, 'MarkdownUp')};
        }

        // Load the resource
        const url = 'url' in this.params ? this.params.url : this.defaultURL;
        const response = await this.window.fetch(url);
        if (!response.ok) {
            const status = response.statusText;
            throw new Error(`Could not fetch "${url}"${status === '' ? '' : `, ${JSON.stringify(status)}`}`);
        }

        // Render the text as Markdown
        const text = await response.text();
        const markdownModel = parseMarkdown(text);
        const markdownTitle = getMarkdownTitle(markdownModel);
        const result = {'elements': markdownElements(markdownModel, url)};
        if (markdownTitle !== null) {
            result.title = markdownTitle;
        }
        return result;
    }
}
