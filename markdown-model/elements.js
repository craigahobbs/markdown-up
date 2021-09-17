// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-model/blob/main/LICENSE

import {getMarkdownParagraphText} from './markdownModel.js';


/**
 * Generate an element model from a markdown model
 *
 * @param {Object} markdown - The markdown model
 * @param {string} [options.url] - Optional markdown file URL
 * @param {Object} [options.codeBlocks] - Optional map of code block language to render function with signature
 *     (language, lines) => elements.
 * @returns {Array}
 */
export function markdownElements(markdown, options = {}) {
    // Generate an element model from the markdown model parts
    return markdownPartElements(markdown.parts, options);
}


// Regex for cleaning-up anchor text
const rAnchorText = /\s+/g;


// Helper function to generate an element model from a markdown part model array
function markdownPartElements(parts, options) {
    const partElements = [];
    for (const markdownPart of parts) {
        // Paragraph?
        if ('paragraph' in markdownPart) {
            const {paragraph} = markdownPart;
            if ('style' in paragraph) {
                const anchorId = getMarkdownParagraphText(paragraph).toLowerCase().replace(rAnchorText, '-');
                partElements.push({
                    'html': paragraph.style,
                    'attr': {'id': anchorId},
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
            const href = 'url' in options && isRelativeURL(link.href) ? `${getBaseURL(options.url)}${link.href}` : link.href;
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
            const src = 'url' in options && isRelativeURL(image.src) ? `${getBaseURL(options.url)}${image.src}` : image.src;
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


// Helper function to check if a URL is relative
function isRelativeURL(url) {
    return !rAbsoluteURL.test(url);
}

const rAbsoluteURL = /^(?:[a-z]+:|\/|\?|#)/;


// Helper function to get a URL's base URL
function getBaseURL(url) {
    return url.slice(0, url.lastIndexOf('/') + 1);
}
