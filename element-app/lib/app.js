// Licensed under the MIT License
// https://github.com/craigahobbs/element-app/blob/main/LICENSE

/** @module lib/app */

import {decodeQueryString, encodeQueryString} from '../../schema-markdown/lib/encode.js';
import {renderElements, validateElements} from '../../element-model/lib/elementModel.js';
import {SchemaMarkdownParser} from '../../schema-markdown/lib/parser.js';
import {validateType} from '../../schema-markdown/lib/schema.js';


// Schema to validate Element Application main results
const elementApplicationTypes = new SchemaMarkdownParser(`\
struct ElementApplicationMain
    optional object(nullable) elements
    optional string(nullable) title
    optional string(nullable) location
`).types;


/**
 * The Element Model Application base class
 *
 * @property {Object} window - The web browser window object
 * @property {?string} title - The default application title
 * @property {string} hashType - The application hash parameters' schema type name (in "hashTypes")
 * @property {Object} hashTypes - The application hash parameters' Schema Markdown type model
 * @property {Object} params - The validated hash parameters object
 */
export class ElementApplication {
    /**
     * Create an application instance
     *
     * @param {Object} window - The web browser window object
     * @param {?string} title - The default application title
     * @param {string} hashType - The application hash parameters' schema type name (in "hashTypes")
     * @param {Object} hashTypes - The application hash parameters' Schema Markdown type model
     */
    constructor(window, title, hashType, hashTypes) {
        this.window = window;
        this.title = title;
        this.hashType = hashType;
        if (typeof hashTypes === 'string') {
            this.hashTypes = (new SchemaMarkdownParser(hashTypes)).types;
        } else {
            this.hashTypes = hashTypes;
        }
        this.params = null;
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
     * Render the application. This method calls updateParams, main, and preRender prior to calling
     * element-model renderElements.
     */
    async render() {
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
            result = ElementApplication.validateMain(await this.main());
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
        const title = 'title' in result && result.title !== null ? result.title : this.title;
        if (title !== null) {
            this.window.document.title = title;
        }

        // On-render notification
        this.preRender();

        // Render the element model
        renderElements(
            this.window.document.body,
            'elements' in result ? result.elements : {'html': 'p', 'elem': {'text': 'No elements'}}
        );

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
        this.params = validateType(this.hashTypes, this.hashType, params);
    }

    /**
     * @typedef MainResult
     * @property {?string} [elements] - The application's element model
     * @property {?string} [location] - The URL to navigate to
     * @property {?string} [title] - The window title
     */

    /**
     * Validate a main result object
     *
     * @param {module:lib/app~MainResult} result
     */
    static validateMain(result) {
        // Validate to the main result schema
        validateType(elementApplicationTypes, 'ElementApplicationMain', result);

        // Validate the elements
        if ('elements' in result) {
            validateElements(result.elements);
        }

        return result;
    }

    /**
     * Override-able application main entry point. The default implementation renders nothing.
     *
     * @abstract
     * @returns {module:lib/app~MainResult}
     */
    // eslint-disable-next-line class-methods-use-this, require-await
    async main() {
        return {'elements': null};
    }

    /**
     * Override-able method that is called prior to application element model render. The default
     * implementation does nothing.
     *
     * @abstract
     */
    // eslint-disable-next-line class-methods-use-this
    preRender() {
        // Default implementation does nothing
    }
}


/**
 * Get a URL's hash ID
 *
 * @param {string} url - The URL
 * @returns {?string} The URL's hash ID, or null if not found
 */
export function getHashID(url) {
    const matchId = url.match(rHashId);
    return matchId !== null ? matchId[1] : null;
}

const rHashId = /[#&]([^=]+)$/;


/**
 * Encode hash parameters with a hash ID
 *
 * @param {Object} params - The hash parameters
 * @param {?string} hashID - The hash ID
 * @returns {string} The encoded hash ID
 */
export function encodeHashID(params, hashID) {
    const paramString = encodeQueryString(params);
    return `#${paramString}${hashID !== null && paramString !== '' ? '&' : ''}${hashID !== null ? hashID : ''}`;
}
