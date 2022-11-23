// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-model/blob/main/LICENSE

/** @module lib/parser */


/**
 * Escape a string for inclusion in Markdown text
 *
 * @param {string} text
 * @returns {string}
 */
export function escapeMarkdownText(text) {
    return text.replace(rEscapeMarkdownText, '\\$1');
}

const rEscapeMarkdownText = /([\\[\]()<>"'*_~`#=+|-])/g;


/**
 * Get a Markdown model's title. Returns null if no title is found.
 *
 * @param {Object} markdown - The markdown model
 * @returns {string|null}
 */
export function getMarkdownTitle(markdown) {
    for (const part of markdown.parts) {
        if ('paragraph' in part && 'style' in part.paragraph) {
            return getMarkdownParagraphText(part.paragraph);
        }
    }
    return null;
}


/**
 * Get a Markdown paragraph model's text
 *
 * @param {Object} paragraph - The markdown paragraph model
 * @returns {string}
 */
export function getMarkdownParagraphText(paragraph) {
    return paragraph.spans.map(getMarkdownSpanText).join('');
}


// Helper function to get a Markdown span model's text
function getMarkdownSpanText(span) {
    if ('image' in span) {
        return span.image.alt;
    } else if ('link' in span) {
        return span.link.spans.map(getMarkdownSpanText).join('');
    } else if ('style' in span) {
        return span.style.spans.map(getMarkdownSpanText).join('');
    }
    return span.text;
}


// Markdown regex
const rLineSplit = /\r?\n/;
const rIndent = /^(?<indent>\s*)(?<notIndent>.*)$/;
const rHeading = /^\s{0,3}(?<heading>#{1,6})\s+(?<text>.*?)(?:\s+#+)?\s*$/;
const rHeadingAlt = /^\s{0,3}(?<heading>=+|-+)\s*$/;
const rHorizontal = /^\s{0,3}(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$/;
const rFenced = /^(?<indent>\s{0,3})(?<fence>(?:`{3,}|~{3,}))(?:\s*(?<language>.+?))?\s*$/;
const rList = /^(?<indent>\s{0,3}(?<mark>-|\*|\+|[0-9][.)]|[1-9][0-9]+[.)])\s)(?<line>.*?)$/;
const rQuote = /^(?<indent>\s{0,3}>\s?)/;
const rTable = /^\s{0,3}(?::?-+:?\s*)?(?:\|\s*:?-+:?\s*)+(?:\|\s*)?$/g;
const rTableRow = /^\s{0,3}(?:(?:\\\||[^|])+\s*)?(?:\|\s*(?:\\\||[^|])*?\s*)+(?:\|\s*)?/g;
const rTableRowTrim = /^\s*\|?/;
const rTableCell = /^\s*(?<cell>(?:\\\||[^|])*?)\s*\|/;
const rTableEscape = /\\(\\|)/g;


/**
 * Parse markdown text or text lines into a markdown model
 *
 * @param {string|string[]} markdown - Markdown text or text lines
 * @param {number} [startLineNumber = 1] - The starting line number of the markdown text
 * @returns {Object} The markdown model
 */
export function parseMarkdown(markdown, startLineNumber = 1) {
    const markdownParts = [];
    let paragraphLines = [];
    let paragraphPart = null;
    let paragraphLineNumber = null;
    let tablePart = null;
    let fencedMark = null;
    let fencedIndent = null;
    let listIndent = null;
    let lineNumber = startLineNumber - 1;

    // Helper function to close the current part
    const closeParagraph = (paragraphStyle = null) => {
        // Block quote "paragraph"
        if (paragraphPart !== null && 'quote' in paragraphPart) {
            // Parse the block quote's Markdown lines
            paragraphPart.quote.parts = parseMarkdown(paragraphLines, paragraphLineNumber).parts;
            paragraphLines = [];

        // List item "paragraph"?
        } else if (paragraphPart !== null && 'list' in paragraphPart) {
            // Parse the list item's Markdown lines
            const {items} = paragraphPart.list;
            items[items.length - 1].parts = parseMarkdown(paragraphLines, paragraphLineNumber).parts;
            paragraphLines = [];

        // Code block "paragraph"?
        } else if (paragraphPart !== null && 'codeBlock' in paragraphPart) {
            // Set the code block lines - strip trailing blank lines of non-fenced code blocks
            let ixLine = paragraphLines.length - 1;
            if (fencedMark === null) {
                for (; ixLine >= 0; ixLine--) {
                    if (paragraphLines[ixLine] !== '') {
                        break;
                    }
                }
            }
            paragraphPart.codeBlock.lines = paragraphLines.slice(0, ixLine + 1);
            paragraphLines = [];

        // Ordinary (or header) paragraph...
        } else if (paragraphLines.length) {
            // Add the new paragraph part
            const part = {'paragraph': {'spans': paragraphSpans(paragraphLines.join('\n'))}};
            if (paragraphStyle !== null) {
                part.paragraph.style = paragraphStyle;
            }
            markdownParts.push(part);
            paragraphLines = [];
        }

        // Clear paragraph state
        paragraphPart = null;
        paragraphLineNumber = null;
        tablePart = null;
    };

    // Process markdown text line by line
    let emptyLine = true;
    let emptyLinePrev = true;
    const markdownStrings = (typeof markdown === 'string' ? [markdown] : markdown);
    for (const markdownString of markdownStrings) {
        for (const lineRaw of markdownString.split(rLineSplit)) {
            const line = lineRaw.replaceAll('\t', '    ');
            const matchLine = line.match(rIndent);
            const lineIndent = matchLine.groups.indent.length;
            emptyLinePrev = emptyLine;
            emptyLine = matchLine.groups.notIndent === '';
            lineNumber += 1;

            // Empty line?
            if (emptyLine) {
                // If there is a container part, add the empty line to the part
                if (paragraphPart !== null && !('quote' in paragraphPart)) {
                    paragraphLines.push(line);
                } else {
                    closeParagraph();
                }
                continue;
            }

            // Within fenced code block?
            const matchFenced = line.match(rFenced);
            if (fencedMark !== null) {
                // Fenced code block end?
                if (matchFenced !== null && matchFenced.groups.fence.startsWith(fencedMark) &&
                    typeof matchFenced.groups.language === 'undefined') {
                    closeParagraph();
                    fencedMark = null;
                    fencedIndent = null;
                } else {
                    paragraphLines.push(line.slice(Math.min(fencedIndent, lineIndent)));
                }
                continue;
            }

            // List item line?
            if (listIndent !== null && lineIndent >= listIndent) {
                paragraphLines.push(line.slice(listIndent));
                continue;
            }

            // Code block line?
            if (lineIndent >= 4 && paragraphPart !== null && 'codeBlock' in paragraphPart) {
                paragraphLines.push(line.slice(4));
                continue;
            }

            // New code block?
            if (lineIndent >= 4 && (emptyLinePrev || paragraphLines.length === 0)) {
                closeParagraph();
                paragraphPart = {'codeBlock': {'startLineNumber': lineNumber}};
                markdownParts.push(paragraphPart);
                paragraphLineNumber = lineNumber;
                paragraphLines.push(line.slice(4));
                continue;
            }

            // Fenced code start?
            if (matchFenced !== null) {
                closeParagraph();
                paragraphPart = {'codeBlock': {'startLineNumber': lineNumber}};
                if (typeof matchFenced.groups.language !== 'undefined') {
                    paragraphPart.codeBlock.language = matchFenced.groups.language;
                }
                markdownParts.push(paragraphPart);
                paragraphLineNumber = lineNumber + 1;
                fencedMark = matchFenced.groups.fence;
                fencedIndent = matchFenced.groups.indent.length;
                continue;
            }

            // Block quote?
            const matchQuote = line.match(rQuote);
            if (matchQuote !== null) {
                if (paragraphPart === null || !('quote' in paragraphPart)) {
                    closeParagraph();
                    paragraphPart = {'quote': {}};
                    markdownParts.push(paragraphPart);
                    paragraphLineNumber = lineNumber;
                }
                paragraphLines.push(line.slice(matchQuote.groups.indent.length));
                continue;
            }

            // Heading?
            const matchHeading = line.match(rHeading);
            if (matchHeading !== null) {
                closeParagraph();
                paragraphLines = [matchHeading.groups.text];
                closeParagraph(`h${matchHeading.groups.heading.length}`);
                continue;
            }

            // Heading (alternate syntax)?
            const matchHeadingAlt = line.match(rHeadingAlt);
            if (matchHeadingAlt !== null && paragraphLines.length !== 0 && paragraphPart === null) {
                closeParagraph(matchHeadingAlt.groups.heading.startsWith('=') ? 'h1' : 'h2');
                continue;
            }

            // Horizontal rule?
            if (rHorizontal.test(line)) {
                closeParagraph();
                markdownParts.push({'hr': 1});
                continue;
            }

            // List?
            const matchList = line.match(rList);
            if (matchList !== null) {
                const curList = (paragraphPart !== null && 'list' in paragraphPart ? paragraphPart : null);
                const curListIsNumbered = (curList !== null && typeof curList.list.start === 'number');
                const start = parseInt(matchList.groups.mark, 10);
                const isNumbered = !isNaN(start);

                // Close current paragraph
                closeParagraph();

                // New list?
                if (curList === null || curListIsNumbered !== isNumbered) {
                    paragraphPart = {'list': {'items': [{}]}};
                    if (isNumbered) {
                        paragraphPart.list.start = start;
                    }
                    markdownParts.push(paragraphPart);
                } else {
                    paragraphPart = curList;
                    curList.list.items.push({});
                }
                paragraphLineNumber = lineNumber;

                // Add the list item line
                paragraphLines.push(matchList.groups.line);
                listIndent = matchList.groups.indent.length;
                continue;
            }

            // Table?
            if (tablePart !== null) {
                // Table row?
                const matchTableRow = line.match(rTableRow);
                if (matchTableRow !== null) {
                    if (!('rows' in tablePart.table)) {
                        tablePart.table.rows = [];
                    }
                    const cells = parseTableCells(line);
                    if (cells.length > tablePart.table.headers.length) {
                        cells.length = tablePart.table.headers.length;
                    }
                    tablePart.table.rows.push(cells.map((cell) => paragraphSpans(cell)));
                    continue;
                } else {
                    tablePart = null;
                }
            } else {
                // Table delimiter following a table header?
                const tableHeader = (paragraphLines.length !== 0 ? paragraphLines[paragraphLines.length - 1] : null);
                const matchTable = (tableHeader !== null ? line.match(rTable) : null);
                const matchTableHeader = (tableHeader !== null && matchTable !== null ? tableHeader.match(rTableRow) : null);
                if (matchTableHeader !== null) {
                    // Does the table header match the delimiter?
                    const headers = parseTableCells(tableHeader).map((cell) => paragraphSpans(cell));
                    const aligns = parseTableCells(line).map(
                        (cell) => (cell.endsWith(':') ? (cell.startsWith(':') ? 'center' : 'right') : 'left')
                    );
                    if (headers.length === aligns.length) {
                        // Remove the table header line and close the open paragraph
                        paragraphLines.length -= 1;
                        closeParagraph();

                        // Add the table markdown part
                        tablePart = {'table': {headers, aligns}};
                        markdownParts.push(tablePart);
                        continue;
                    }
                }
            }

            // End code block?
            if (paragraphPart !== null && 'codeBlock' in paragraphPart) {
                closeParagraph();
            }

            // End list?
            if (listIndent !== null && emptyLinePrev) {
                closeParagraph();
                listIndent = null;
            }

            // Add the paragraph line
            paragraphLines.push(line);
        }
    }

    // Close current paragraph
    closeParagraph();

    return {'parts': markdownParts};
}


// Helper function to parse a table line's cells
function parseTableCells(line) {
    const cells = [];
    let matchCell;
    let lineText = line.replace(rTableRowTrim, '');
    while ((matchCell = lineText.match(rTableCell)) !== null) {
        cells.push(matchCell.groups.cell.replaceAll(rTableEscape, '$1'));
        lineText = lineText.slice(matchCell[0].length);
    }
    lineText = lineText.trim();
    if (lineText !== '') {
        cells.push(lineText);
    }
    return cells;
}


// Markdown span regex
const rPartLinkText = '(?<linkText>(?:\\\\\\]|(?!\\\\\\]|\\])[\\s\\S])*?)';
const rPartLinkHrefTitle = '\\([\\s\\n\\r]*(?<linkHref>(?!<)(?:\\\\\\)|(?!\\\\\\))[^ \\n])*?|<(?:\\\\>|(?!\\\\>)[^>\\n])*?>)' +
      '(?:[\\s\\n\\r]+(?<linkTitle>' +
      '"(?:\\\\"|(?!\\\\"|")[\\s\\S])*?"|' +
      "'(?:\\\\'|(?!\\\\'|')[\\s\\S])*?'|" +
      '\\((?:\\\\\\)|(?!\\\\\\)|\\))[\\s\\S])*?\\)' +
      ')[\\s\\n\\r]*)?\\)';
const rSpans = new RegExp(
    // eslint-disable-next-line prefer-template
    '(?<br>(?: {2,}|\\\\)\\r?\\n)|' +
    '(?<linkImg>\\[[\\s\\n\\r]*!\\[)' + `${rPartLinkText}\\]${rPartLinkHrefTitle}[\\s\\n\\r]*\\]`.replaceAll('<link', '<linkImg') +
        `${rPartLinkHrefTitle}|`.replaceAll('<link', '<linkImgLink') +
    `(?<link>!?\\[)${rPartLinkText}\\]${rPartLinkHrefTitle}|` +
    '(?<linkAlt><)(?<linkAltHref>(?<linkAltScheme>[[A-Za-z]{3,}:|[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@)[^ \\n]+)>|' +
    '(?<bold>\\*{2})(?!\\**\\s)(?<boldText>(?:\\\\\\*|(?!\\\\\\*)[\\s\\S])*?(?:\\\\\\*|[^\\\\\\s])\\**)\\*{2}|' +
    '(?<boldu>_{2})(?!_*\\s)(?<bolduText>(?:\\\\_|(?!\\\\_)[\\s\\S])*?(?:\\\\_|[^\\\\\\s])_*)_{2}(?!_*[A-Za-z0-9])|' +
    '(?<italic>\\*)(?!\\**\\s)(?<italicText>(?:\\\\\\*|(?!\\\\\\*)[\\s\\S])*?(?:\\\\\\*|[^\\\\\\s]))\\*|' +
    '(?<italicu>_)(?!_*\\s)(?<italicuText>(?:\\\\_|(?!\\\\_)[\\s\\S])*?(?:\\\\_|[^\\\\\\s]))_(?!_*[A-Za-z0-9])|' +
    '(?<strike>~{1,2})(?!~)(?<strikeText>(?:\\\\~|(?!\\\\~)[\\s\\S])*?(?:\\\\~|[^\\\\~]))\\k<strike>(?!~)|' +
    '(?<code>`+)(?!`)(?<codeSp> )?(?<codeText>(?:\\k<code>`+|(?!\\k<codeSp>\\k<code>(?!`))[\\s\\S])*)\\k<codeSp>\\k<code>(?!`)',
    'mg'
);
const rSpanNewlinesEnd = /[\r\n]$/;
const rSpanNewlines = /[\r\n]/g;


// Helper function to translate markdown paragraph text to a markdown paragraph span model array
function paragraphSpans(text) {
    const spans = [];

    // Iterate the span matches
    let ixSearch = 0;
    for (const match of text.matchAll(rSpans)) {
        // Add any preceding text
        if (ixSearch < match.index) {
            spans.push({'text': removeEscapes(text.slice(ixSearch, match.index))});
        }

        // Line break?
        if (typeof match.groups.br !== 'undefined') {
            spans.push({'br': 1});

        // Link-image?
        } else if (typeof match.groups.linkImg !== 'undefined') {
            const [linkImgText, linkImgHref, linkImgTitle] = getLinkText(match, 'linkImg');
            const [, linkImgLinkHref, linkImgLinkTitle] = getLinkText(match, 'linkImgLink');
            const imgSpan = {'image': {'src': linkImgHref, 'alt': linkImgText}};
            if (linkImgTitle !== null) {
                imgSpan.image.title = linkImgTitle;
            }
            const span = {'link': {'href': linkImgLinkHref, 'spans': [imgSpan]}};
            if (linkImgLinkTitle !== null) {
                span.link.title = removeEscapes(linkImgLinkTitle);
            }
            spans.push(span);

        // Link or image?
        } else if (typeof match.groups.link !== 'undefined') {
            const [linkText, linkHref, linkTitle] = getLinkText(match, 'link');
            let span;
            if (match.groups.link.startsWith('!')) {
                span = {'image': {'src': linkHref, 'alt': linkText}};
                if (linkTitle !== null) {
                    span.image.title = linkTitle;
                }
            } else {
                span = {'link': {'href': linkHref, 'spans': paragraphSpans(linkText)}};
                if (linkTitle !== null) {
                    span.link.title = removeEscapes(linkTitle);
                }
            }
            spans.push(span);

        // Link (alternate syntax)?
        } else if (typeof match.groups.linkAlt !== 'undefined') {
            const {linkAltScheme} = match.groups;
            const linkAltHref = (linkAltScheme.endsWith('@') ? `mailto:${match.groups.linkAltHref}` : match.groups.linkAltHref);
            spans.push({'link': {'href': linkAltHref, 'spans': [{'text': linkAltHref}]}});

        // Bold style?
        } else if (typeof match.groups.bold !== 'undefined' || typeof match.groups.boldu !== 'undefined') {
            const boldText = match.groups.boldText ?? match.groups.bolduText;
            spans.push({'style': {'style': 'bold', 'spans': paragraphSpans(boldText)}});

        // Italic style?
        } else if (typeof match.groups.italic !== 'undefined' || typeof match.groups.italicu !== 'undefined') {
            const italicText = match.groups.italicText ?? match.groups.italicuText;
            spans.push({'style': {'style': 'italic', 'spans': paragraphSpans(italicText)}});

        // Strikethrough style?
        } else if (typeof match.groups.strike !== 'undefined') {
            spans.push({'style': {'style': 'strikethrough', 'spans': paragraphSpans(match.groups.strikeText)}});

        // Code?
        } else if (typeof match.groups.code !== 'undefined') {
            const codeText = match.groups.codeText.replace(rSpanNewlinesEnd, '').replaceAll(rSpanNewlines, ' ');
            spans.push({'code': codeText});
        }

        ixSearch = match.index + match[0].length;
    }

    // Add any remaining text
    if (ixSearch < text.length) {
        spans.push({'text': removeEscapes(text.slice(ixSearch))});
    }

    return spans;
}


// Helper function to get a link/image span's [text, href, title]
function getLinkText(match, prefix) {
    let text = match.groups[`${prefix}Text`] ?? null;
    text = (text !== null ? removeEscapes(text) : null);
    let href = match.groups[`${prefix}Href`];
    href = removeEscapes(href.startsWith('<') ? href.slice(1, href.length - 1) : href, true);
    let title = match.groups[`${prefix}Title`] ?? null;
    title = (title !== null ? removeEscapes(title.slice(1, title.length - 1)) : null);
    return [text, href, title];
}


// Helper function to remove span text escapes and replace character references
function removeEscapes(text, href = false) {
    return text.replace(href ? rEscapeHref : rEscape, '$1').
        replace(rEntityRef, (match, entity) => {
            const entityChar = entityRefs[entity] ?? null;
            return entityChar !== null ? entityChar : match;
        }).
        replace(rDecimalRef, (match, decimal) => String.fromCharCode(parseInt(decimal, 10))).
        replace(rHexRef, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
}


// Escape and entity regex
const rEscape = /\\([!-~])/g;
const rEscapeHref = /\\([!-/:-@[-`{-~])/g;
const rEntityRef = /&([A-Za-z]+[0-9]*);/g;
const rDecimalRef = /&#([0-9]{1,7});/g;
const rHexRef = /&#[Xx]([A-Fa-f0-9]{1,6});/g;
const entityRefs = {
    'acute': '\xb4',
    'amp': '\x26',
    'apos': '\x27',
    'bdquo': '\u201e',
    'brvbar': '\xa6',
    'cedil': '\xb8',
    'cent': '\xa2',
    'copy': '\xa9',
    'curren': '\xa4',
    'dagger': '\u2020',
    'Dagger': '\u2021',
    'deg': '\xb0',
    'divide': '\xf7',
    'emsp': '\u2003',
    'ensp': '\u2002',
    'euro': '\u20ac',
    'frac12': '\xbd',
    'frac14': '\xbc',
    'frac34': '\xbe',
    'gt': '\x3e',
    'hellip': '\u2026',
    'iexcl': '\xa1',
    'iquest': '\xbf',
    'laquo': '\xab',
    'ldquo': '\u201c',
    'lrm': '\u200e',
    'lsaquo': '\u2039',
    'lsquo': '\u2018',
    'lt': '\x3c',
    'macr': '\xaf',
    'mdash': '\u2014',
    'micro': '\xb5',
    'middot': '\xb7',
    'nbsp': '\xa0',
    'ndash': '\u2013',
    'not': '\xac',
    'ordf': '\xaa',
    'ordm': '\xba',
    'para': '\xb6',
    'permil': '\u2030',
    'plusmn': '\xb1',
    'pound': '\xa3',
    'quot': '\x22',
    'raquo': '\xbb',
    'rdquo': '\u201d',
    'reg': '\xae',
    'rlm': '\u200f',
    'rsaquo': '\u203a',
    'rsquo': '\u2019',
    'sbquo': '\u201a',
    'sect': '\xa7',
    'shy': '\xad',
    'sup1': '\xb9',
    'sup2': '\xb2',
    'sup3': '\xb3',
    'thinsp': '\u2009',
    'times': '\xd7',
    'trade': '\u2122',
    'uml': '\xa8',
    'yen': '\xa5',
    'zwj': '\u200d',
    'zwnj': '\u200c'
};
