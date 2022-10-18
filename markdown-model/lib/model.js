// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-model/blob/main/LICENSE

/** @module lib/model */

import {parseSchemaMarkdown} from '../../schema-markdown/lib/parser.js';
import {validateType} from '../../schema-markdown/lib/schema.js';


/**
 * Validate a markdown model
 *
 * @param {Object} markdown - The markdown model
 * @returns {Object}
 */
export function validateMarkdownModel(markdown) {
    return validateType(markdownModelTypes, 'Markdown', markdown);
}


/** The Markdown schema-markdown type model */
export const markdownModelTypes = parseSchemaMarkdown(`\
# Markdown document
struct Markdown

    # The markdown document's parts
    MarkdownPart[] parts


# Markdown document part
union MarkdownPart

    # A paragraph
    Paragraph paragraph

    # A horizontal rule (value is ignored)
    int(== 1) hr

    # A list
    List list

    # A block quote
    BlockQuote quote

    # A code block
    CodeBlock codeBlock

    # A table
    Table table


# Paragraph markdown part
struct Paragraph

    # The paragraph style
    optional ParagraphStyle style

    # The paragraph span array
    Span[len > 0] spans


# Paragraph style enum
enum ParagraphStyle
    h1
    h2
    h3
    h4
    h5
    h6


# List markdown part
struct List

    # The list is numbered and this is starting number
    optional int(>= 0) start

    # The list's items
    ListItem[len > 0] items


# List item
struct ListItem

    # The list's parts
    MarkdownPart[len > 0] parts


# Block quote markdown part
struct BlockQuote

    # The block quote's parts
    MarkdownPart[] parts


# Code block markdown part
struct CodeBlock

    # The code block's language
    optional string(len > 0) language

    # The code block's text lines
    string[] lines

    # The code block's starting line number
    optional int(>= 1) startLineNumber


# Table markdown part
struct Table

    # The table header cell array
    TableRow headers

    # The table cell alignment array
    TableAlignment[len > 0] aligns

    # The table data
    optional TableRow[len > 0] rows


# A table row
typedef TableCell[len > 0] TableRow


# A table cell
typedef Span[len > 0] TableCell


# Table cell alignment
enum TableAlignment
    left
    right
    center


# Paragraph span
union Span

    # Text span
    string(len > 0) text

    # Line break (value is ignored)
    int(== 1) br

    # Style span
    StyleSpan style

    # Link span
    LinkSpan link

    # Image span
    ImageSpan image

    # Code span
    string(len > 0) code


# Style span
struct StyleSpan

    # The span's character style
    CharacterStyle style

    # The contained spans
    Span[len > 0] spans


# Character style enum
enum CharacterStyle
    bold
    italic
    strikethrough


# Link span
struct LinkSpan

    # The link's URL
    string(len > 0) href

    # The image's title
    optional string(len > 0) title

    # The contained spans
    Span[len > 0] spans


# Image span
struct ImageSpan

    # The image URL
    string(len > 0) src

    # The image's alternate text
    string(len > 0) alt

    # The image's title
    optional string(len > 0) title
`);
