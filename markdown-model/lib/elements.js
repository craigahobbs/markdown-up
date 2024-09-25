// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-model/blob/main/LICENSE

/** @module lib/elements */

import {getMarkdownParagraphText} from './parser.js';
import {highlightElements} from './highlight.js';


/**
 * The markdownElements function's options object
 *
 * @typedef {Object} MarkdownElementsOptions
 * @property {Object.<string, object>} [codeBlocks] - The [code block]{@link module:lib/elements~CodeBlockFn} render-function map
 * @property {function} [urlFn] - The [URL modifier function]{@link module:lib/elements~URLFn}
 * @property {boolean} [headerIds] - If true, generate header IDs
 * @property {Set} [usedHeaderIds] - Set of used header IDs
 */

/**
 * A code block render function
 *
 * @callback CodeBlockFn
 * @param {object} codeBlock - The [code block model]{@link module:lib/elements~CodeBlock}
 * @returns {*} The code block's element model
 */

/**
 * @typedef {Object} CodeBlock
 * @property {string} language - The code block language
 * @property {string[]} lines - The code blocks lines
 * @property {number} [startLineNumber] - The code blocks lines
 */

/**
 * A URL modifier function
 *
 * @callback URLFn
 * @param {string} url - The URL
 * @returns {string} The modified URL
 */


/**
 * Generate an element model from a Markdown model.
 *
 * @param {Object} markdown - The [Markdown model]{@link https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown'}
 * @param {?object} [options] - The [options object]{@link module:lib/elements~MarkdownElementsOptions}
 * @returns {*} The Markdown's [element model]{@link https://github.com/craigahobbs/element-model#readme}
 */
export function markdownElements(markdown, options = null) {
    const usedHeaderIds = (options !== null && 'usedHeaderIds' in options ? options.usedHeaderIds : new Set());
    return markdownPartsElements(markdown.parts, options, usedHeaderIds);
}


function markdownPartsElements(parts, options, usedHeaderIds) {
    return parts.map((part) => markdownPartElements(part, options, usedHeaderIds));
}


function markdownPartElements(part, options, usedHeaderIds) {
    const [partKey] = Object.keys(part);

    // List?
    if (partKey === 'list') {
        const {items} = part.list;
        const itemElements = items.map((item) => markdownPartsElements(item.parts, options, usedHeaderIds));
        return markdownListPartElements(part, itemElements.map((elem) => ({'html': 'li', 'elem': elem})));

    // Block quote?
    } else if (partKey === 'quote') {
        return {
            'html': 'blockquote',
            'elem': markdownPartsElements(part.quote.parts, options, usedHeaderIds)
        };

    // Code block?
    } else if (partKey === 'codeBlock') {
        const {codeBlock} = part;
        if (options !== null && 'codeBlocks' in options && 'language' in codeBlock && codeBlock.language in options.codeBlocks) {
            return options.codeBlocks[codeBlock.language](codeBlock);
        }
        return highlightElements(part.codeBlock.language ?? null, part.codeBlock.lines);
    }

    return markdownPartElementsBase(part, options, usedHeaderIds);
}


/**
 * Generate an element model from a Markdown model.
 *
 * This is the asynchronous form of the [markdownElements function]{@link module:lib/elements.markdownElements}.
 * Use this form of the function if you have one or more asynchronous code block functions.
 *
 * @param {Object} markdown - The [Markdown model]{@link https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown'}
 * @param {?object} [options] - The [options object]{@link module:lib/elements~MarkdownElementsOptions}
 * @returns {*} The Markdown's [element model]{@link https://github.com/craigahobbs/element-model#readme}
 */
export function markdownElementsAsync(markdown, options = null) {
    const usedHeaderIds = (options !== null && 'usedHeaderIds' in options ? options.usedHeaderIds : new Set());
    return markdownPartsElementsAsync(markdown.parts, options, usedHeaderIds);
}


async function markdownPartsElementsAsync(parts, options, usedHeaderIds) {
    const elements = [];
    for (const part of parts) {
        elements.push(await markdownPartElementsAsync(part, options, usedHeaderIds));
    }
    return elements;
}


async function markdownPartElementsAsync(part, options, usedHeaderIds) {
    const [partKey] = Object.keys(part);

    // List?
    if (partKey === 'list') {
        const {items} = part.list;
        const itemElements = [];
        for (const item of items) {
            itemElements.push(await markdownPartsElementsAsync(item.parts, options, usedHeaderIds));
        }
        return markdownListPartElements(part, itemElements.map((elem) => ({'html': 'li', 'elem': elem})));

    // Block quote?
    } else if (partKey === 'quote') {
        return {
            'html': 'blockquote',
            'elem': await markdownPartsElementsAsync(part.quote.parts, options, usedHeaderIds)
        };

    // Code block?
    } else if (partKey === 'codeBlock') {
        const {codeBlock} = part;
        if (options !== null && 'codeBlocks' in options && 'language' in codeBlock && codeBlock.language in options.codeBlocks) {
            return options.codeBlocks[codeBlock.language](codeBlock);
        }
        return highlightElements(part.codeBlock.language ?? null, part.codeBlock.lines);
    }

    return markdownPartElementsBase(part, options, usedHeaderIds);
}


function markdownListPartElements(part, listItemElements) {
    const {list} = part;
    return {
        'html': 'start' in list ? 'ol' : 'ul',
        'attr': 'start' in list && list.start > 1 ? {'start': `${list.start}`} : null,
        'elem': listItemElements
    };
}


function markdownPartElementsBase(part, options, usedHeaderIds) {
    const [partKey] = Object.keys(part);

    // Paragraph?
    if (partKey === 'paragraph') {
        const {paragraph} = part;
        if ('style' in paragraph) {
            // Determine the header ID, if requested
            let headerId = null;
            if (options !== null && 'headerIds' in options && options.headerIds) {
                headerId = markdownHeaderId(getMarkdownParagraphText(paragraph));

                // Duplicate header ID?
                if (usedHeaderIds.has(headerId)) {
                    let ix = 1;
                    let headerIdNew;
                    do {
                        ix += 1;
                        headerIdNew = `${headerId}${ix}`;
                    } while (usedHeaderIds.has(headerIdNew));
                    headerId = headerIdNew;
                }
                usedHeaderIds.add(headerId);

                // Header ID hash URL fixup?
                if (options !== null && 'urlFn' in options) {
                    headerId = options.urlFn(`#${headerId}`).slice(1);
                }
            }

            return {
                'html': paragraph.style,
                'attr': headerId !== null ? {'id': headerId} : null,
                'elem': paragraphSpanElements(paragraph.spans, options)
            };
        }

        return {
            'html': 'p',
            'elem': paragraphSpanElements(paragraph.spans, options)
        };

    // Table?
    } else if (partKey === 'table') {
        const {table} = part;
        return {
            'html': 'table',
            'elem': [
                {
                    'html': 'thead',
                    'elem': {
                        'html': 'tr',
                        'elem': table.headers.map((header, ixHeader) => ({
                            'html': 'th',
                            'attr': {'style': `text-align: ${ixHeader < table.aligns.length ? table.aligns[ixHeader] : 'left'}`},
                            'elem': paragraphSpanElements(header, options)
                        }))
                    }
                },
                !('rows' in table) ? null : ({
                    'html': 'tbody',
                    'elem': table.rows.map((row) => ({
                        'html': 'tr',
                        'elem': row.map((cell, ixCell) => ({
                            'html': 'td',
                            'attr': {'style': `text-align: ${ixCell < table.aligns.length ? table.aligns[ixCell] : 'left'}`},
                            'elem': paragraphSpanElements(cell, options)
                        }))
                    }))
                })
            ]
        };
    }

    // Horizontal rule?
    // else if (partKey === 'hr')
    return {'html': 'hr'};
}


// Helper function to generate an element model from a markdown span model array
function paragraphSpanElements(spans, options) {
    const spanElements = [];
    for (const span of spans) {
        const [spanKey] = Object.keys(span);

        // Text span?
        if (spanKey === 'text') {
            spanElements.push({'text': span.text});

        // Line break?
        } else if (spanKey === 'br') {
            spanElements.push({'html': 'br'});

        // Style span?
        } else if (spanKey === 'style') {
            const {style} = span;
            spanElements.push({
                'html': (style.style === 'strikethrough' ? 'del' : (style.style === 'italic' ? 'em' : 'strong')),
                'elem': paragraphSpanElements(style.spans, options)
            });

        // Link span?
        } else if (spanKey === 'link') {
            const {link} = span;
            let {href} = link;

            // URL fixup?
            if (options !== null && 'urlFn' in options) {
                href = options.urlFn(href);
            }

            const linkElements = {
                'html': 'a',
                'attr': {'href': href},
                'elem': paragraphSpanElements(link.spans, options)
            };
            if ('title' in link) {
                linkElements.attr.title = link.title;
            }
            spanElements.push(linkElements);

        // Image span?
        } else if (spanKey === 'image') {
            const {image} = span;
            let {src} = image;

            // Relative link fixup?
            if (options !== null && 'urlFn' in options) {
                src = options.urlFn(src);
            }

            const imageElement = {
                'html': 'img',
                'attr': {'src': src, 'alt': image.alt, 'style': 'max-width: 100%;'}
            };
            if ('title' in image) {
                imageElement.attr.title = image.title;
            }
            spanElements.push(imageElement);

        // Link reference span?
        } else if (spanKey === 'linkRef') {
            const {linkRef} = span;
            spanElements.push(...paragraphSpanElements(linkRef.spans, options));

        // Code span?
        } else if (spanKey === 'code') {
            spanElements.push({'html': 'code', 'elem': {'text': span.code}});
        }
    }

    return spanElements;
}


/**
 * Generate a Markdown header ID from text
 *
 * @param {string} text - The text
 * @returns {string}
 */
export function markdownHeaderId(text) {
    return text.toLowerCase().
        replace(rHeaderStart, '').replace(rHeaderEnd, '').
        replace(rHeaderIdRemove, '').replace(rHeaderIdDash, '-');
}

const rHeaderStart = /^[^a-z0-9]+/;
const rHeaderEnd = /[^a-z0-9]+$/;
const rHeaderIdRemove = /['"]/g;
const rHeaderIdDash = /[^a-z0-9]+/g;
