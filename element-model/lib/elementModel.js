// Licensed under the MIT License
// https://github.com/craigahobbs/element-model/blob/main/LICENSE

/** @module lib/elementModel */


/**
 * Custom error class for element model validation errors.
 */
class ElementModelValidationError extends Error {
    /**
     * Creates a new ElementModelValidationError instance.
     * @param {string} message - The error message describing the validation failure.
     */
    constructor(message) {
        super(message);
        this.name = 'ElementModelValidationError';
    }
}


// Set of valid element members
const elementTagMembers = new Set(['html', 'svg', 'text']);
const elementMembers = new Set([...elementTagMembers, 'attr', 'elem', 'callback']);


// Helper function for throwing validation value exceptions
function throwValueError(message, value) {
    const valueStr = JSON.stringify(value);
    throw new ElementModelValidationError(`${message} ${valueStr.slice(0, 100)} (type '${typeof value}')`);
}


/**
 * Validate an element model
 *
 * @param {?(Object|Array)} elements - The element model.
 *     An element model is either null, an element object, or an array of any of these.
 * @returns {?(Object|Array)} The element model (unchanged)
 * @throws {ElementModelValidationError} Validation error string
 */
export function validateElements(elements) {
    // Array of elements?
    if (Array.isArray(elements)) {
        // Validate the sub-elements
        for (const subElements of elements) {
            validateElements(subElements);
        }

    // Non-null?
    } else if (elements !== null) {
        // Non-object?
        if (typeof elements !== 'object') {
            throwValueError('Invalid element', elements);
        }

        // Check for element tag members and unknown members
        const tagMembers = [];
        const unknownMembers = [];
        for (const elementMember of Object.keys(elements)) {
            if (elementTagMembers.has(elementMember)) {
                tagMembers.push(elementMember);
            }
            if (!elementMembers.has(elementMember)) {
                unknownMembers.push(elementMember);
            }
        }
        if (tagMembers.length === 0) {
            throwValueError('Missing element member', elements);
        } else if (tagMembers.length !== 1) {
            throwValueError(`Multiple element members ${tagMembers}`, elements);
        } else if (unknownMembers.length !== 0) {
            throw new ElementModelValidationError(`Unknown element member '${unknownMembers[0]}'`);
        }

        // Validate the tag
        const [tagMember] = tagMembers;
        const tag = elements[tagMember];
        if (tagMember !== 'text' && (typeof tag !== 'string' || tag.length === 0)) {
            throwValueError(`Invalid ${tagMember} tag`, tag);
        }

        // Validate attributes
        if ('attr' in elements) {
            // Text element?
            if ('text' in elements) {
                throwValueError('Invalid member "attr" for text element', elements.text);
            }

            // Validate the attributes
            if (typeof elements.attr !== 'object' && elements.attr !== null) {
                throwValueError('Invalid attributes', elements.attr);
            }
        }

        // Validate child elements
        if ('elem' in elements) {
            // Text element?
            if ('text' in elements) {
                throwValueError('Invalid member "elem" for text element', elements.text);
            }

            // Validate the sub-elements
            validateElements(elements.elem);
        }

        // Validate creation callback
        if ('callback' in elements && elements.callback !== null && typeof elements.callback !== 'function') {
            throwValueError('Invalid element callback function', elements.callback);
        }
    }

    return elements;
}


/**
 * Render an element model
 *
 * @param {Element} parent - The parent element to render within
 * @param {?(Object|Array)} [elements=null] - The element model.
 *     An element model is either null, an element object, or an array of any of these.
 * @param {boolean} [clear=true] - If true, empty parent before rendering
 * @throws {ElementModelValidationError} Validation error string
 */
export function renderElements(parent, elements = null, clear = true) {
    validateElements(elements);
    if (clear) {
        parent.innerHTML = '';
    }
    renderElementsHelper(parent, elements);
}


// Helper function to create an Element object and append it to the given parent Element object
function renderElementsHelper(parent, elements) {
    if (Array.isArray(elements)) {
        for (const element of elements) {
            renderElementsHelper(parent, element);
        }
    } else if (elements !== null) {
        const element = elements;
        let browserElement;

        // Create an element of the appropriate type
        const document = parent.ownerDocument;
        if ('text' in element) {
            const elementText = (typeof element.text === 'string' ? element.text : String(element.text));
            browserElement = document.createTextNode(elementText);
        } else if ('svg' in element) {
            browserElement = document.createElementNS('http://www.w3.org/2000/svg', element.svg);
        } else {
            browserElement = document.createElement(element.html);
        }

        // Add attributes, if any, to the newly created element
        if ('attr' in element && element.attr !== null) {
            for (const [attr, value] of Object.entries(element.attr)) {
                // Skip null values
                if (value !== null) {
                    const valueStr = (typeof value === 'string' ? value : String(value));
                    browserElement.setAttribute(attr, valueStr);
                }
            }
        }

        // Create the newly created element's child elements
        if ('elem' in element) {
            renderElementsHelper(browserElement, element.elem);
        }

        // Add the child element
        parent.appendChild(browserElement);

        // Call the element callback, if any
        if ('callback' in element && element.callback !== null) {
            element.callback(browserElement);
        }
    }
}


/**
 * Render an element model to an HTML or SVG string. Note that 'callback' members are ignored.
 *
 * @param {?(Object|Array)} [elements=null] - The element model.
 *     An element model is either null, an element object, or an array of any of these.
 * @param {?(number|string)} [indent=null] - Indentation string or number of spaces (like JSON.stringify)
 * @returns {string} The HTML or SVG string
 * @throws {ElementModelValidationError} Validation error string
 */
export function renderElementsToString(elements = null, indent = null) {
    validateElements(elements);

    // Compute the indent string
    let indentStr = '';
    if (typeof indent === 'string') {
        indentStr = indent;
    } else if (typeof indent === 'number') {
        indentStr = ' '.repeat(Math.max(0, indent));
    }

    // Render the element model as an HTML/SVG string
    const elementStr = renderElementsToStringHelper(elements, indentStr, 0);
    if (elementStr.startsWith('<html')) {
        return `<!DOCTYPE html>\n${elementStr}`;
    }
    return elementStr;
}


// Helper function to render elements to string
function renderElementsToStringHelper(elements, indentStr, level) {
    if (elements === null) {
        return '';
    } else if (Array.isArray(elements)) {
        return elements.map(element => renderElementsToStringHelper(element, indentStr, level)).join('');
    }

    // Text node
    const indentPrefix = indentStr.repeat(level);
    const newline = indentStr ? '\n' : '';
    if ('text' in elements) {
        const elementText = (typeof elements.text === 'string' ? elements.text : String(elements.text));
        const elementsText = (newline ? elementText.trim() : elementText);
        return `${indentPrefix}${escapeHtml(elementsText)}${newline}`;
    }

    // Determine tag and type
    const isSVG = 'svg' in elements;
    const tag = (isSVG ? elements.svg : elements.html).toLowerCase();
    const isVoid = !isSVG && voidTags.has(tag);

    // Attributes
    let attrStr = '';
    let elementsAttr = elements.attr ?? null;
    if (level === 0 && isSVG) {
        if (elementsAttr === null) {
            elementsAttr = {};
        }
        elementsAttr.xmlns = 'http://www.w3.org/2000/svg';
    }
    if (elementsAttr !== null) {
        for (const [attr, value] of Object.entries(elementsAttr).sort((a1, a2) => a1[0] < a2[0] ? -1 : 1)) {
            if (value !== null) {
                const valueStr = (typeof value === 'string' ? value : String(value));
                attrStr += ` ${attr}="${escapeHtml(valueStr)}"`;
            }
        }
    }

    // HTML void element?
    if (isVoid) {
        return `${indentPrefix}<${tag}${attrStr} />${newline}`;
    }

    // Render the element and its children
    const childrenStr = 'elem' in elements ? renderElementsToStringHelper(elements.elem, indentStr, level + 1) : '';
    return `${indentPrefix}<${tag}${attrStr}>${newline}${childrenStr}${indentPrefix}</${tag}>${newline}`;
}


// The set of void (single-line) HTML tags
const voidTags = new Set(
    ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr']
);


// Helper function to escape HTML special characters
function escapeHtml(str) {
    return str.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
