// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-model/blob/main/LICENSE

/** @module lib/parser */


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
const rHeading = /^\s{0,3}(?<heading>#{1,6})\s+(?<text>.*?)\s*$/;
const rHeadingAlt = /^\s{0,3}(?<heading>=+|-+)\s*$/;
const rHorizontal = /^\s{0,3}(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$/;
const rFenced = /^(?<fence>\s{0,3}(?:`{3,}|~{3,}))(?:\s*(?<language>.+?))?\s*$/;
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
                } else {
                    paragraphLines.push(line);
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
            if (lineIndent >= 4 && (emptyLinePrev || tablePart !== null)) {
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
const rEscape = /\\(\\|\*|_|\{|\}|\[|\]|\(|\)|#|\+|-|\.|!|~)/g;
const rSpans = new RegExp(
    '(?<br>\\s{2}$)|' +
        '(?<linkImg>\\[!\\[)(?<linkImgText>[\\s\\S]*?)\\]\\((?<linkImgHrefImg>[\\s\\S]*?)\\)\\]\\((?<linkImgHref>[^\\s]+?)\\)|' +
        '(?<link>!?\\[)(?<linkText>[\\s\\S]*?)\\]\\((?<linkHref>[^\\s]+?)(?:\\s*"(?<linkTitle>[\\s\\S]*?)"\\s*)?\\)|' +
        '(?<linkAlt><)(?<linkAltHref>[[a-z]+:[^\\s]*?)>|' +
        '(?<boldPre>\\\\\\*)?(?<bold>\\*{2})(?!\\**\\s)(?<boldText>(?:\\\\\\*|(?!\\\\\\*)[\\s\\S])*?(?:\\\\\\*|[^\\\\\\s])\\**)\\*{2}|' +
        // eslint-disable-next-line max-len
        '(?<bolduPre>\\\\_|[A-Za-z0-9])?(?<boldu>_{2})(?!_*\\s)(?<bolduText>(?:\\\\_|(?!\\\\_)[\\s\\S])*?(?:\\\\_|[^\\\\\\s])_*)_{2}(?!_*[A-Za-z0-9])|' +
        '(?<italicPre>\\\\\\*)?(?<italic>\\*)(?!\\**\\s)(?<italicText>(?:\\\\\\*|(?!\\\\\\*)[\\s\\S])*?(?:\\\\\\*|[^\\\\\\s]))\\*|' +
        // eslint-disable-next-line max-len
        '(?<italicuPre>\\\\_|[A-Za-z0-9])?(?<italicu>_)(?!_*\\s)(?<italicuText>(?:\\\\_|(?!\\\\_)[\\s\\S])*?(?:\\\\_|[^\\\\\\s]))_(?!_*[A-Za-z0-9])|' +
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

        // Link-image span?
        } else if (typeof match.groups.linkImg !== 'undefined') {
            const imgSpan = {'image': {'src': removeEscapes(match.groups.linkImgHrefImg), 'alt': removeEscapes(match.groups.linkImgText)}};
            const span = {'link': {'href': removeEscapes(match.groups.linkImgHref), 'spans': [imgSpan]}};
            spans.push(span);

        // Link span?
        } else if (match.groups.link === '[') {
            const span = {'link': {'href': removeEscapes(match.groups.linkHref), 'spans': paragraphSpans(match.groups.linkText)}};
            if (typeof match.groups.linkTitle !== 'undefined') {
                span.link.title = removeEscapes(match.groups.linkTitle);
            }
            spans.push(span);

        // Link span (alternate syntax)?
        } else if (typeof match.groups.linkAlt !== 'undefined') {
            spans.push({'link': {'href': removeEscapes(match.groups.linkAltHref), 'spans': paragraphSpans(match.groups.linkAltHref)}});

        // Image span?
        } else if (match.groups.link === '![') {
            const span = {'image': {'src': removeEscapes(match.groups.linkHref), 'alt': removeEscapes(match.groups.linkText)}};
            if (typeof match.groups.linkTitle !== 'undefined') {
                span.image.title = removeEscapes(match.groups.linkTitle);
            }
            spans.push(span);

        // Bold style-span
        } else if (typeof match.groups.bold !== 'undefined' || typeof match.groups.boldu !== 'undefined') {
            const boldPre = match.groups.boldPre ?? match.groups.bolduPre ?? null;
            const bold = match.groups.bold ?? match.groups.boldu;
            const boldText = match.groups.boldText ?? match.groups.bolduText;
            if (bold === '__' && boldPre !== null && boldPre !== '\\_') {
                spans.push({'text': `${boldPre}${bold}${boldText}${bold}`});
            } else {
                if (boldPre !== null) {
                    spans.push({'text': removeEscapes(boldPre)});
                }
                spans.push({'style': {'style': 'bold', 'spans': paragraphSpans(boldText)}});
            }

        // Italic style-span
        } else if (typeof match.groups.italic !== 'undefined' || typeof match.groups.italicu !== 'undefined') {
            const italicPre = match.groups.italicPre ?? match.groups.italicuPre ?? null;
            const italic = match.groups.italic ?? match.groups.italicu;
            const italicText = match.groups.italicText ?? match.groups.italicuText;
            if (italic === '_' && italicPre !== null && italicPre !== '\\_') {
                spans.push({'text': `${italicPre}${italic}${italicText}${italic}`});
            } else {
                if (italicPre !== null) {
                    spans.push({'text': removeEscapes(italicPre)});
                }
                spans.push({'style': {'style': 'italic', 'spans': paragraphSpans(italicText)}});
            }

        // Strikethrough style-span
        } else if (typeof match.groups.strike !== 'undefined') {
            spans.push({'style': {'style': 'strikethrough', 'spans': paragraphSpans(match.groups.strikeText)}});

        // Code span
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


function removeEscapes(text) {
    return text.replace(rEscape, '$1');
}
