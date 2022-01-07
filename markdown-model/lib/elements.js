// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-model/blob/main/LICENSE

/** @module lib/elements */

import {getMarkdownParagraphText} from './markdownModel.js';


/**
 * The markdownElements function's options object
 *
 * @typedef {Object} MarkdownElementsOptions
 * @property {Object.<string, module:lib/elements~CodeBlockFn>} [codeBlocks] - The code block render-function map
 * @property {module:lib/elements~HashFn} [hashFn] - The hash URL modifier function
 * @property {boolean} [headerIds] - If true, generate header IDs
 * @property {string} [url] - Markdown file URL
 */

/**
 * A code block render function
 *
 * @callback CodeBlockFn
 * @param {string} language - The code block language
 * @param {string[]} lines - The code blocks lines
 * @returns {*} The code block's element model
 */

/**
 * A hash modifier function
 *
 * @callback HashFn
 * @param {string} hashURL - The hash URL
 * @returns {string} The fixed-up hash URL
 */


/**
 * Generate an element model from a markdown model
 *
 * @param {Object} markdown - The markdown model
 * @param {module:lib/elements~MarkdownElementsOptions} [options] - Options object
 * @returns {*} The markdown's element model
 */
export function markdownElements(markdown, options = {}) {
    return markdownPartElements(markdown.parts, {...options, 'usedHeaderIds': new Set()});
}


// Regex for cleaning-up anchor text
const rHeaderStart = /^[^a-z0-9]+/;
const rHeaderEnd = /[^a-z0-9]+$/;
const rHeaderIdRemove = /['"]/g;
const rHeaderIdDash = /[^a-z0-9]+/g;


// Helper function to generate an element model from a markdown part model array
function markdownPartElements(parts, options) {
    const partElements = [];
    for (const markdownPart of parts) {
        // Paragraph?
        if ('paragraph' in markdownPart) {
            const {paragraph} = markdownPart;
            if ('style' in paragraph) {
                // Determine the header ID, if requested
                let headerId = null;
                if ('headerIds' in options && options.headerIds) {
                    headerId = getMarkdownParagraphText(paragraph).toLowerCase().
                        replace(rHeaderStart, '').replace(rHeaderEnd, '').
                        replace(rHeaderIdRemove, '').replace(rHeaderIdDash, '-');

                    // Duplicate header ID?
                    if (options.usedHeaderIds.has(headerId)) {
                        let ix = 1;
                        let headerIdNew;
                        do {
                            ix += 1;
                            headerIdNew = `${headerId}${ix}`;
                        } while (options.usedHeaderIds.has(headerIdNew));
                        headerId = headerIdNew;
                    }
                    options.usedHeaderIds.add(headerId);

                    // Hash prefix fixup?
                    if ('hashFn' in options) {
                        headerId = options.hashFn(`#${headerId}`).slice(1);
                    }
                }

                partElements.push({
                    'html': paragraph.style,
                    'attr': headerId !== null ? {'id': headerId} : null,
                    'elem': paragraphSpanElements(paragraph.spans, options)
                });
            } else {
                partElements.push({
                    'html': 'p',
                    'elem': paragraphSpanElements(paragraph.spans, options)
                });
            }

        // Horizontal rule?
        } else if ('hr' in markdownPart) {
            partElements.push({'html': 'hr'});

        // List?
        } else if ('list' in markdownPart) {
            const {list} = markdownPart;
            partElements.push({
                'html': 'start' in list ? 'ol' : 'ul',
                'attr': 'start' in list && list.start > 1 ? {'start': `${list.start}`} : null,
                'elem': list.items.map((item) => ({
                    'html': 'li',
                    'elem': markdownPartElements(item.parts, options)
                }))
            });

        // Code block?
        } else if ('codeBlock' in markdownPart) {
            const {codeBlock} = markdownPart;

            // Render the code block elements
            if ('codeBlocks' in options && 'language' in codeBlock && codeBlock.language in options.codeBlocks) {
                partElements.push(options.codeBlocks[codeBlock.language](codeBlock.language, codeBlock.lines));
            } else {
                partElements.push(
                    {'html': 'pre', 'elem': {'html': 'code', 'elem': codeBlock.lines.map((line) => ({'text': `${line}\n`}))}}
                );
            }
        }
    }

    return partElements;
}


// Helper function to generate an element model from a markdown span model array
function paragraphSpanElements(spans, options) {
    const spanElements = [];
    for (const span of spans) {
        // Text span?
        if ('text' in span) {
            spanElements.push({'text': span.text});

        // Line break?
        } else if ('br' in span) {
            spanElements.push({'html': 'br'});

        // Style span?
        } else if ('style' in span) {
            const {style} = span;
            spanElements.push({
                'html': style.style === 'italic' ? 'em' : 'strong',
                'elem': paragraphSpanElements(style.spans, options)
            });

        // Link span?
        } else if ('link' in span) {
            const {link} = span;
            let {href} = link;

            // Hash-only link?
            if (href.startsWith('#')) {
                if ('hashFn' in options) {
                    href = options.hashFn(href);
                }

            // Relative link fixup?
            } else if ('url' in options && isRelativeURL(href)) {
                href = `${getBaseURL(options.url)}${href}`;
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
        } else if ('image' in span) {
            const {image} = span;
            let {src} = image;

            // Relative link fixup?
            if ('url' in options && isRelativeURL(src)) {
                src = `${getBaseURL(options.url)}${src}`;
            }

            const imageElement = {
                'html': 'img',
                'attr': {'src': src, 'alt': image.alt}
            };
            if ('title' in image) {
                imageElement.attr.title = image.title;
            }
            spanElements.push(imageElement);
        }
    }
    return spanElements;
}


/**
 * Test if a URL is relative
 *
 * @param {string} url - The URL
 * @returns {boolean}
 */
export function isRelativeURL(url) {
    return !rNotRelativeURL.test(url);
}

const rNotRelativeURL = /^(?:[a-z]+:|\/|\?|#)/;


/**
 * Get a URL's base URL
 *
 * @param {string} url - The URL
 * @returns {string}
 */
export function getBaseURL(url) {
    return url.slice(0, url.lastIndexOf('/') + 1);
}
