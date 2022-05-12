// Licensed under the MIT License
// https://github.com/craigahobbs/schema-markdown-doc/blob/main/LICENSE

/** @module lib/schemaMarkdownDoc */

import {getEnumValues, getReferencedTypes, getStructMembers} from '../../schema-markdown/lib/schema.js';
import {markdownElements} from '../../markdown-model/lib/elements.js';
import {parseMarkdown} from '../../markdown-model/lib/parser.js';


// Non-breaking space character
const nbsp = String.fromCharCode(160);


/**
 * The [schemaMarkdownDoc]{@link module:lib/schemaMarkdownDoc.schemaMarkdownDoc} options object
 *
 * @typedef {Object} SchemaMarkdownDocOptions
 * @property {string} [params] - The page's hash param string with tag removed
 * @property {Object[]} [actionURLs] -
 *     The [action URLs]{@link https://craigahobbs.github.io/schema-markdown-doc/app/#var.vType='ActionURL'} override
 */


/**
 * Generate the Schema Markdown user type documentation element model
 *
 * @param {Object} types - The [user type map]{@link https://craigahobbs.github.io/schema-markdown-doc/app/#var.vType='Types'}
 * @param {string} typeName - The type name for which to generate documentation
 * @param {?Object} [options = null] - The [options]{@link module:lib/schemaMarkdownDoc~SchemaMarkdownDocOptions} object
 * @returns {Object[]}
 */
export function schemaMarkdownDoc(types, typeName, options = null) {
    // Compute the referenced types
    if (!(typeName in types)) {
        throw new Error(`Unknown type '${typeName}'`);
    }
    const userType = types[typeName];
    const {action = null} = userType;
    const referencedTypes = getReferencedTypes(types, typeName);
    let typesFilter;
    if (action !== null) {
        typesFilter = [typeName, action.path, action.query, action.input, action.output, action.errors];
    } else {
        typesFilter = [typeName];
    }
    const filteredTypes =
          Object.entries(referencedTypes).sort().filter(([name]) => !typesFilter.includes(name)).map(([, type]) => type);

    // Return the user type's element model
    return [
        // The user type
        userTypeElements(types, typeName, 'h1', options, typeName),

        // Referenced types
        !filteredTypes.length ? null : [
            {'html': 'hr'},
            {'html': 'h2', 'elem': {'text': 'Referenced Types'}},
            filteredTypes.map((refType) => userTypeElements(types, Object.values(refType)[0].name, 'h3', options))
        ]
    ];
}


function markdownElementsNull(text = null) {
    return text !== null ? markdownElements(parseMarkdown(text)) : null;
}


function typeHref(typeName, options) {
    const paramString = (options !== null && 'params' in options ? options.params : '');
    return paramString !== '' ? `${paramString}&type_${typeName}` : `type_${typeName}`;
}


function typeElements(type, options) {
    if ('array' in type) {
        return [typeElements(type.array.type, options), {'text': `${nbsp}[]`}];
    } else if ('dict' in type) {
        return [
            !('keyType' in type.dict) || 'builtin' in type.dict.keyType ? null
                : [typeElements(type.dict.keyType, options), {'text': `${nbsp}:${nbsp}`}],
            typeElements(type.dict.type, options),
            {'text': `${nbsp}{}`}
        ];
    } else if ('user' in type) {
        return {'html': 'a', 'attr': {'href': `#${typeHref(type.user, options)}`}, 'elem': {'text': type.user}};
    }
    return {'text': type.builtin};
}


function attrElements({type, attr = null, optional = false}) {
    // Create the array of attribute "parts" (lhs, op, rhs)
    const parts = [];
    const typeName = type.array ? 'array' : (type.dict ? 'dict' : 'value');
    attrParts(parts, typeName, attr, optional);

    // Array or dict key/value attributes?
    if ('array' in type) {
        if ('attr' in type.array) {
            attrParts(parts, 'value', type.array.attr, false);
        }
    } else if ('dict' in type) {
        if ('keyAttr' in type.dict) {
            attrParts(parts, 'key', type.dict.keyAttr, false);
        }
        if ('attr' in type.dict) {
            attrParts(parts, 'value', type.dict.attr, false);
        }
    }

    // Return the attributes element model
    return !parts.length ? null : parts.map(
        (part, ixPart) => [
            ixPart !== 0 ? {'html': 'br'} : null,
            {'text': part.op ? `${part.lhs}${nbsp}${part.op}${nbsp}${part.rhs}` : part.lhs}
        ]
    );
}


function attrParts(parts, noun, attr, optional) {
    if (optional) {
        parts.push({'lhs': 'optional'});
    }
    if (attr !== null && 'nullable' in attr) {
        parts.push({'lhs': 'nullable'});
    }
    if (attr !== null && 'gt' in attr) {
        parts.push({'lhs': noun, 'op': '>', 'rhs': attr.gt});
    }
    if (attr !== null && 'gte' in attr) {
        parts.push({'lhs': noun, 'op': '>=', 'rhs': attr.gte});
    }
    if (attr !== null && 'lt' in attr) {
        parts.push({'lhs': noun, 'op': '<', 'rhs': attr.lt});
    }
    if (attr !== null && 'lte' in attr) {
        parts.push({'lhs': noun, 'op': '<=', 'rhs': attr.lte});
    }
    if (attr !== null && 'eq' in attr) {
        parts.push({'lhs': noun, 'op': '==', 'rhs': attr.eq});
    }
    if (attr !== null && 'lenGT' in attr) {
        parts.push({'lhs': `len(${noun})`, 'op': '>', 'rhs': attr.lenGT});
    }
    if (attr !== null && 'lenGTE' in attr) {
        parts.push({'lhs': `len(${noun})`, 'op': '>=', 'rhs': attr.lenGTE});
    }
    if (attr !== null && 'lenLT' in attr) {
        parts.push({'lhs': `len(${noun})`, 'op': '<', 'rhs': attr.lenLT});
    }
    if (attr !== null && 'lenLTE' in attr) {
        parts.push({'lhs': `len(${noun})`, 'op': '<=', 'rhs': attr.lenLTE});
    }
    if (attr !== null && 'lenEq' in attr) {
        parts.push({'lhs': `len(${noun})`, 'op': '==', 'rhs': attr.lenEq});
    }
}


function userTypeElements(types, typeName, titleTag, options, title = null, introMarkdown = null) {
    const userType = types[typeName];

    // Generate the header element models
    const titleElements = (titleDefault) => ({
        'html': titleTag,
        'attr': {'id': typeHref(typeName, options)},
        'elem': {'text': title !== null ? title : titleDefault}
    });

    // Struct?
    if ('struct' in userType) {
        const {struct} = userType;
        const members = 'members' in struct ? getStructMembers(types, struct) : null;
        const memberAttrElem = members !== null
            ? Object.fromEntries(members.map((member) => [member.name, attrElements(member)])) : null;
        const hasAttr = members !== null && Object.values(memberAttrElem).some((attrElem) => attrElem !== null);
        const memberDocElem = members !== null
            ? Object.fromEntries(members.map(({name, doc}) => [name, markdownElementsNull(doc)])) : null;
        const hasDoc = members !== null && Object.values(memberDocElem).some((docElem) => docElem !== null);

        // Return the struct documentation element model
        return [
            titleElements('union' in struct && struct.union ? `union ${typeName}` : `struct ${typeName}`),
            !('bases' in struct) ? null : {'html': 'p', 'elem': [
                {'text': 'Bases: '},
                struct.bases.map((base, ixBase) => [
                    ixBase === 0 ? null : {'text': ', '},
                    {'html': 'a', 'attr': {'href': `#${typeHref(base, options)}`}, 'elem': {'text': base}}
                ])
            ]},
            markdownElementsNull(struct.doc),

            // Struct members
            !members || !members.length ? markdownElementsNull('The struct is empty.') : {'html': 'table', 'elem': [
                {'html': 'tr', 'elem': [
                    {'html': 'th', 'elem': {'text': 'Name'}},
                    {'html': 'th', 'elem': {'text': 'Type'}},
                    hasAttr ? {'html': 'th', 'elem': {'text': 'Attributes'}} : null,
                    hasDoc ? {'html': 'th', 'elem': {'text': 'Description'}} : null
                ]},
                members.map((member) => ({'html': 'tr', 'elem': [
                    {'html': 'td', 'elem': {'text': member.name}},
                    {'html': 'td', 'elem': typeElements(member.type, options)},
                    hasAttr ? {'html': 'td', 'elem': memberAttrElem[member.name]} : null,
                    hasDoc ? {'html': 'td', 'elem': memberDocElem[member.name]} : null
                ]}))
            ]}
        ];

    // Enumeration?
    } else if ('enum' in userType) {
        const enum_ = userType.enum;
        const values = 'values' in enum_ ? getEnumValues(types, enum_) : null;
        const valueDocElem = values !== null
            ? Object.fromEntries(values.map(({name, doc}) => [name, markdownElementsNull(doc)])) : null;
        const hasDoc = values !== null && Object.values(valueDocElem).some((docElem) => docElem !== null);

        // Return the enumeration documentation element model
        return [
            titleElements(`enum ${typeName}`),
            !('bases' in enum_) ? null : {'html': 'p', 'elem': [
                {'text': 'Bases: '},
                enum_.bases.map((base) => ({'html': 'a', 'attr': {'href': `#${typeHref(base, options)}`}, 'elem': {'text': base}}))
            ]},
            markdownElementsNull(enum_.doc),
            introMarkdown !== null ? markdownElementsNull(introMarkdown) : null,

            // Enumeration values
            !values || !values.length ? markdownElementsNull('The enum is empty.') : {'html': 'table', 'elem': [
                {'html': 'tr', 'elem': [
                    {'html': 'th', 'elem': {'text': 'Value'}},
                    hasDoc ? {'html': 'th', 'elem': {'text': 'Description'}} : null
                ]},
                values.map((value) => ({'html': 'tr', 'elem': [
                    {'html': 'td', 'elem': {'text': value.name}},
                    hasDoc ? {'html': 'td', 'elem': valueDocElem[value.name]} : null
                ]}))
            ]}
        ];

    // Typedef?
    } else if ('typedef' in userType) {
        const {typedef} = userType;
        const attrElem = 'attr' in typedef ? attrElements(typedef) : null;

        // Return the typedef documentation element model
        return [
            titleElements(`typedef ${typeName}`),
            markdownElementsNull(typedef.doc),

            // Typedef type description
            {'html': 'table', 'elem': [
                {'html': 'tr', 'elem': [
                    {'html': 'th', 'elem': {'text': 'Type'}},
                    attrElem !== null ? {'html': 'th', 'elem': {'text': 'Attributes'}} : null
                ]},
                {'html': 'tr', 'elem': [
                    {'html': 'td', 'elem': typeElements(typedef.type, options)},
                    attrElem !== null ? {'html': 'td', 'elem': attrElem} : null
                ]}
            ]}
        ];

    // Action?
    } else if ('action' in userType) {
        const {action} = userType;

        // Add "UnexpectedError" to the action's errors
        let actionErrorTypeName;
        let actionErrorTypes;
        let actionErrorEnum;
        if ('errors' in action) {
            actionErrorTypeName = action.errors;
            actionErrorTypes = getReferencedTypes(types, actionErrorTypeName);
            actionErrorEnum = {...types[actionErrorTypeName].enum};
            if ('values' in actionErrorEnum) {
                actionErrorEnum.values = [...actionErrorEnum.values];
            } else {
                actionErrorEnum.values = [];
            }
        } else {
            actionErrorTypeName = `${action.name}_errors`;
            actionErrorTypes = {};
            actionErrorEnum = {'name': actionErrorTypeName, 'values': []};
        }
        if (!actionErrorEnum.values.some((value) => value.name === 'UnexpectedError')) {
            actionErrorEnum.values.push({
                'name': 'UnexpectedError',
                'doc': ['An unexpected error occurred while processing the request']
            });
        }
        actionErrorTypes[actionErrorTypeName] = {'enum': actionErrorEnum};

        // If no URLs passed use the action's URLs
        let actionURLs = (options !== null && 'actionURLs' in options ? options.actionURLs : null);
        if (actionURLs === null && 'urls' in action) {
            actionURLs = action.urls.map(({method = null, path = null}) => {
                const url = {
                    'url': path !== null ? path : `/${typeName}`
                };
                if (method !== null) {
                    url.method = method;
                }
                return url;
            });
        }

        // Return the action documentation element model
        return [
            titleElements(`action ${typeName}`),
            markdownElementsNull(action.doc),
            actionURLs === null || !actionURLs.length ? null : [
                {'html': 'p', 'elem': [
                    {'html': 'b', 'elem': {'text': 'Note: '}},
                    {'text': `The request is exposed at the following ${actionURLs.length === 1 ? 'URL:' : 'URLs:'}`}
                ]},
                actionURLs.map((url) => ({'html': 'p', 'elem': [
                    {'text': `${nbsp}${nbsp}`},
                    {
                        'html': 'a',
                        'attr': {'href': url.url}, 'elem': {'text': url.method ? `${url.method} ${url.url}` : url.url}
                    }
                ]}))
            ],

            // Action types
            'path' in action ? userTypeElements(types, action.path, 'h2', options, 'Path Parameters') : null,
            'query' in action ? userTypeElements(types, action.query, 'h2', options, 'Query Parameters') : null,
            'input' in action ? userTypeElements(types, action.input, 'h2', options, 'Input Parameters') : null,
            'output' in action ? userTypeElements(types, action.output, 'h2', options, 'Output Parameters') : null,
            userTypeElements(
                actionErrorTypes,
                actionErrorTypeName,
                'h2',
                options,
                'Error Codes',
                `\
If an application error occurs, the response is of the form:

    {
        "error": "<code>",
        "message": "<message>"
    }

"message" is optional. "<code>" is one of the following values:`
            )
        ];
    }

    // Unreachable for valid type models
    return null;
}
