// Licensed under the MIT License
// https://github.com/craigahobbs/element-model/blob/main/LICENSE


// Set of valid element members
const elementTagMembers = new Set(['html', 'svg', 'text']);
const elementMembers = new Set([...elementTagMembers, 'attr', 'elem', 'callback']);


// Helper function for throwing validation value exceptions
function throwValueError(message, value) {
    const valueStr = `${JSON.stringify(value)}`;
    throw new Error(`${message} ${valueStr.slice(0, 100)} (type '${typeof value}')`);
}


/**
 * Validate an element model
 *
 * @param {?(Object|Array)} elements - The element model.
 *     An element model is either null, an element object, or an array of any of these.
 * @throws {Error} Validation error string
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
            throw new Error(`Unknown element member '${unknownMembers[0]}'`, elements);
        }

        // Validate the tag
        const [tagMember] = tagMembers;
        const tag = elements[tagMember];
        if (typeof tag !== 'string' || (tagMember !== 'text' && tag.length === 0)) {
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
        if ('callback' in elements && typeof elements.callback !== 'function') {
            throwValueError('Invalid element callback function', elements.callback);
        }
    }
}


/**
 * Render an element model
 *
 * @param {Element} parent - The parent element to render within
 * @param {?(Object|Array)} [elements=null] - The element model.
 *     An element model is either null, an element object, or an array of any of these.
 * @param {boolean} [clear=true] - If true, empty parent before rendering
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
            browserElement = document.createTextNode(element.text);
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
                    browserElement.setAttribute(attr, `${value}`);
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
        if ('callback' in element) {
            element.callback(browserElement);
        }
    }
}
