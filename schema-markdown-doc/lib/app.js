// Licensed under the MIT License
// https://github.com/craigahobbs/schema-markdown-doc/blob/main/LICENSE

/** @module lib/app */

import {encodeQueryString, typeModel as smdTypeModel, validateTypeModel} from '../../schema-markdown/index.js';
import {ElementApplication} from '../../element-app/lib/app.js';
import {UserTypeElements} from './userTypeElements.js';


// The application's hash parameter type model
const schemaMarkdownDocHashTypes = `\
#
# This is the schema-markdown-doc application:
#
# [schema-markdown-doc](https://github.com/craigahobbs/schema-markdown-doc#readme)
#
# ## Hash Parameters
#
# The schema-markdown-doc application recognizes the following hash parameters:
#
struct SchemaMarkdownDoc

    # The resource URL
    optional string(len > 0) url

    # The type name. If not provided, the index is displayed.
    optional string(len > 0) name

    # Display the application's hash parameter documentation
    optional int(== 1) help
`;


/**
 * The SchemaMarkdownDoc application. The SchemaMarkdownDoc class extends the element-app
 * [ElementApplication]{@link https://craigahobbs.github.io/element-app/module-lib_app.ElementApplication.html}
 * class.
 *
 * @extends ElementApplication
 * @property {?string} defaultURL - The default resource URL
 */
export class SchemaMarkdownDoc extends ElementApplication {
    /**
     * Create an application instance
     *
     * @param {Object} window - The web browser window object
     * @param {?string} [defaultURL = null] - The default resource URL
     */
    constructor(window, defaultURL = null) {
        super(window, 'schema-markdown-doc', 'SchemaMarkdownDoc', schemaMarkdownDocHashTypes);
        this.defaultURL = defaultURL;
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
        if ('help' in this.params) {
            return {
                'elements': new UserTypeElements(this.params).getElements(this.hashTypes, this.hashType)
            };
        }

        // Load the type model JSON resource
        const url = 'url' in this.params ? this.params.url : this.defaultURL;
        let typeModel = smdTypeModel;
        if (url !== null) {
            const response = await this.window.fetch(url);
            if (!response.ok) {
                const status = response.statusText;
                throw new Error(`Could not fetch "${url}"${status === '' ? '' : `, ${JSON.stringify(status)}`}`);
            }

            // Validate type model JSON
            typeModel = validateTypeModel(await response.json());
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
                                'attr': {'href': `#${encodeQueryString({...this.params, 'name': name})}`},
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
                    'attr': {'href': `#${encodeQueryString(indexParams)}`},
                    'elem': {'text': 'Back to documentation index'}
                }
            },

            // The user type elements
            (new UserTypeElements(this.params)).getElements(typeModel.types, typeName)
        ];
    }
}
