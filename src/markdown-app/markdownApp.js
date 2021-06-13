// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-app/blob/main/LICENSE

import {SchemaMarkdownParser, UserTypeElements, decodeQueryString, validateType} from 'schema-markdown/index.js';
import {markdownElements, parseMarkdown} from 'markdown-model/index.js';
import {renderElements} from 'element-model/index.js';


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
        window.addEventListener(...this.windowHashChangeArgs);
    }

    // Uninitialize the global application state
    uninit() {
        if (this.windowHashChangeArgs !== null) {
            window.removeEventListener(...this.windowHashChangeArgs);
            this.windowHashChangeArgs = null;
        }
    }

    // Helper function to parse and validate the hash parameters
    updateParams(params = null) {
        // Clear, then validate the hash parameters (may throw)
        this.params = null;
        this.params = validateType(markdownAppTypes, 'MarkdownApp', decodeQueryString(params));
    }

    /**
     * Render the Markdown application
     */
    render() {
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
        renderElements(this.window.document.body);

        // Type model URL provided?
        const markdownURL = 'url' in this.params ? this.params.url : this.defaultMarkdownURL;
        if ('cmd' in this.params) {
            // 'help' in this.params.cmd
            this.window.document.title = 'MarkdownApp';
            renderElements(this.window.document.body, (new UserTypeElements(this.params)).getElements(markdownAppTypes, 'MarkdownApp'));
        } else {
            // Load the Markdown resource
            window.fetch(markdownURL).
                then((response) => {
                    if (!response.ok) {
                        throw new Error(`Could not fetch '${markdownURL}': ${response.statusText}`);
                    }
                    return response.text();
                }).then((markdownText) => {
                    this.renderMarkdownPage(markdownText, markdownURL);
                }).catch(({message}) => {
                    this.renderErrorPage(message);
                });
        }
    }

    // Helper function to render a Markdown page
    renderMarkdownPage(markdownText, markdownURL) {
        const model = parseMarkdown(markdownText);

        // Determine the page title
        let title = 'MarkdownApp';
        for (const part of model.parts) {
            if ('paragraph' in part && 'style' in part.paragraph) {
                title = part.paragraph.spans.map((span) => ('text' in span ? span.text : '')).join('');
                break;
            }
        }

        // Render the Markdown page
        this.window.document.title = title;
        renderElements(this.window.document.body, markdownElements(model, markdownURL));
    }

    // Helper function to render an error page
    renderErrorPage(message) {
        this.window.document.title = 'Error';
        renderElements(this.window.document.body, MarkdownApp.errorPage(message));
    }

    // Helper function to generate the error page's element hierarchy model
    static errorPage(message) {
        return {
            'html': 'p',
            'elem': {'text': `Error: ${message}`}
        };
    }
}
