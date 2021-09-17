// Licensed under the MIT License
// https://github.com/craigahobbs/schema-markdown-doc/blob/main/LICENSE

import * as smd from '../schema-markdown/index.js';
import {UserTypeElements} from './userTypeElements.js';
import {renderElements} from '../element-model/index.js';


// The application's hash parameter type model
const appHashTypes = (new smd.SchemaMarkdownParser(`\
# The SchemaMarkdownDoc application hash parameters struct
struct SchemaMarkdownDoc

    # The resource URL
    optional string(len > 0) url

    # The type name. If not provided, the index is displayed.
    optional string(len > 0) name

    # Optional command
    optional Command cmd

# Application command union
union Command

    # Render the application's hash parameter documentation
    int(== 1) help
`).types);


/**
 * The SchemaMarkdownDoc application
 *
 * @property {Object} window - The web browser window object
 * @property {?string} defaultURL - The default resource URL
 * @property {Object} params - The validated hash parameters object
 */
export class SchemaMarkdownDoc {
    /**
     * Create an application instance
     *
     * @property {Object} window - The web browser window object
     * @property {?string} defaultURL - The default resource URL
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
     * @property {?string} [defaultURL=null] - The default resource URL
     * @returns {SchemaMarkdownDoc}
     */
    static async run(window, defaultURL = null) {
        const app = new SchemaMarkdownDoc(window, defaultURL);
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
        this.params = smd.validateType(appHashTypes, 'SchemaMarkdownDoc', params);
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

        // Render the application
        this.window.document.title = 'title' in result ? result.title : 'SchemaMarkdownDoc';
        renderElements(this.window.document.body, result.elements);
    }

    // Generate the application's element model
    async main() {
        // Application command?
        if ('cmd' in this.params) {
            // 'help' in this.params.cmd
            return {'elements': (new UserTypeElements(this.params)).getElements(appHashTypes, 'SchemaMarkdownDoc')};
        }

        // Load the type model JSON resource
        const url = 'url' in this.params ? this.params.url : this.defaultURL;
        let {typeModel} = smd;
        if (url !== null) {
            const response = await this.window.fetch(url);
            if (!response.ok) {
                const status = response.statusText;
                throw new Error(`Could not fetch "${url}"${status === '' ? '' : `, ${JSON.stringify(status)}`}`);
            }

            // Validate type model JSON
            typeModel = smd.validateTypeModel(await response.json());
        }

        // Type name specified?
        if ('name' in this.params) {
            if (!(this.params.name in typeModel.types)) {
                throw new Error(`Unknown type name '${this.params.name}'`);
            }
            return {'title': typeModel.title, 'elements': this.typeElements(typeModel, this.params.name)};
        }

        // Index
        return {'title': typeModel.title, 'elements': this.indexElements(typeModel)};
    }

    // Generate the index page's element hierarchy model
    indexElements(typeModel) {
        // Build the index groups
        const groups = {};
        for (const [userTypeName, userType] of Object.entries(typeModel.types).sort()) {
            let docGroup;
            if ('enum' in userType) {
                docGroup = 'docGroup' in userType.enum ? userType.enum.docGroup : 'Enumerations';
            } else if ('struct' in userType) {
                docGroup = 'docGroup' in userType.struct ? userType.struct.docGroup : 'Structs';
            } else if ('typedef' in userType) {
                docGroup = 'docGroup' in userType.typedef ? userType.typedef.docGroup : 'Typedefs';
            } else {
                docGroup = 'docGroup' in userType.action ? userType.action.docGroup : 'Actions';
            }
            if (!(docGroup in groups)) {
                groups[docGroup] = [];
            }
            groups[docGroup].push(userTypeName);
        }

        // Return the index element model
        return [
            // Title
            {'html': 'h1', 'elem': {'text': typeModel.title}},

            // Groups
            Object.keys(groups).sort().map((group) => [
                {'html': 'h2', 'elem': {'text': group}},
                {
                    'html': 'ul',
                    'attr': {'class': 'smd-index-list'},
                    'elem': {'html': 'li', 'elem': {'html': 'ul', 'elem': groups[group].sort().map(
                        (name) => ({
                            'html': 'li',
                            'elem': {
                                'html': 'a',
                                'attr': {'href': `#${smd.encodeQueryString({...this.params, 'name': name})}`},
                                'elem': {'text': name}
                            }
                        })
                    )}}
                }
            ])
        ];
    }

    // Generate the type page's element hierarchy model
    typeElements(typeModel, typeName) {
        const indexParams = {...this.params};
        delete indexParams.name;
        return [
            // Navigation bar
            {
                'html': 'p',
                'elem': {
                    'html': 'a',
                    'attr': {'href': `#${smd.encodeQueryString(indexParams)}`},
                    'elem': {'text': 'Back to documentation index'}
                }
            },

            // The user type elements
            (new UserTypeElements(this.params)).getElements(typeModel.types, typeName)
        ];
    }
}
