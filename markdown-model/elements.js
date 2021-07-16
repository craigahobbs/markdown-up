// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-model/blob/main/LICENSE


/**
 * Generate an element model from a markdown model
 *
 * @param {Object} markdown - The markdown model
 * @param {?string} url - The markdown file's URL
 * @param {?Object} codeBlockLanguages - Optional map of language to code block render function with signature (lines) => elements.
 * @returns {Object[]}
 */
export function markdownElements(markdown, url = null, codeBlockLanguages = null) {
    // Generate an element model from the markdown model parts
    return markdownPartElements(markdown.parts, url, codeBlockLanguages);
}


// Helper function to generate an element model from a markdown part model array
function markdownPartElements(parts, url, codeBlockLanguages) {
    const partElements = [];
    for (const markdownPart of parts) {
        // Paragraph?
        if ('paragraph' in markdownPart) {
            const {paragraph} = markdownPart;
            partElements.push({
                'html': 'style' in paragraph ? paragraph.style : 'p',
                'elem': paragraphSpanElements(paragraph.spans, url)
            });

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
                    'elem': markdownPartElements(item.parts, url, codeBlockLanguages)
                }))
            });

        // Code block?
        } else if ('codeBlock' in markdownPart) {
            const {codeBlock} = markdownPart;

            // Render the code block elements
            if (codeBlockLanguages !== null && 'language' in codeBlock && codeBlock.language in codeBlockLanguages) {
                partElements.push(codeBlockLanguages[codeBlock.language](codeBlock));
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
function paragraphSpanElements(spans, url) {
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
                'elem': paragraphSpanElements(style.spans, url)
            });

        // Link span?
        } else if ('link' in span) {
            const {link} = span;
            const href = url !== null && isRelativeURL(link.href) ? `${getBaseURL(url)}${link.href}` : link.href;
            const linkElements = {
                'html': 'a',
                'attr': {'href': href},
                'elem': paragraphSpanElements(link.spans, url)
            };
            if ('title' in link) {
                linkElements.attr.title = link.title;
            }
            spanElements.push(linkElements);

        // Image span?
        } else if ('image' in span) {
            const {image} = span;
            const src = url !== null && isRelativeURL(image.src) ? `${getBaseURL(url)}${image.src}` : image.src;
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

const rAbsoluteURL = /^(?:[a-z]{3,5}:|\/|\?|#)/;


// Helper function to get a URL's base URL
function getBaseURL(url) {
    return url.slice(0, url.lastIndexOf('/') + 1);
}
