// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-model/blob/main/LICENSE

/** @module lib/highlight */

import {getStructMembers, validateType} from '../../schema-markdown/lib/schema.js';
import {escapeMarkdownText} from './parser.js';
import {parseSchemaMarkdown} from '../../schema-markdown/lib/parser.js';


/**
 * Render a code block
 *
 * @param {Object} codeBlock - The [code block model]{@link module:lib/elements~CodeBlock}
 * @param {?Object} options - The [options object]{@link module:lib/elements~MarkdownElementsOptions}
 * @returns {*} The code block's [element model]{@link https://github.com/craigahobbs/element-model#readme}
 */
export function codeBlockElements(codeBlock, options) {
    if ('language' in codeBlock) {
        const language = codeBlock.language.toLowerCase();

        // Options-provided code block render function?
        if (options !== null && 'codeBlocks' in options && language in options.codeBlocks) {
            return options.codeBlocks[language](codeBlock, options);
        }

        // Built-in code block render function?
        if (language in highlightBuiltin) {
            return highlightBuiltin[language](codeBlock, options);
        }
    }

    // No-syntax-highlighing code block render
    return highlightElements(null, codeBlock.lines, options);
}


/**
 * Compile an array of highlight models
 *
 * @param {Object[]} markdown - The array of
 *     [Highlight models]{@link https://craigahobbs.github.io/markdown-model/model/#var.vName='Highlight'}
 * @returns {Object} The map of language name/alias to [code block render function]{@link module:lib/elements~CodeBlockFn}
 */
export function compileHighlightModels(highlights) {
    const highlightMap = {};
    for (const highlight of highlights) {
        const highlightRegex = {};
        const parts = [];

        // Validate the highlight model
        validateType(highlightTypes, 'Highlight', highlight);

        // Create regex-based regex
        for (const memberName of getStructMembers(highlightTypes, highlightTypes.Highlight.struct).map((member) => member.name)) {
            if (memberName !== 'names' && memberName in highlight) {
                const part = highlight[memberName].map((str) => `(?:${str})`).join('|');
                highlightRegex[memberName] = new RegExp(`^(?:${part})`, 'm');
                parts.push(part);
            }
        }

        // Add the special aggregate-highlight-matching regexp
        highlightRegex.highlight = new RegExp(parts.map((part) => `(?:${part})`).join('|'), 'm');

        // Add the name/alias to code block render function
        const highlightFn = (codeBlock, options) => highlightElements(highlightRegex, codeBlock.lines, options);
        for (const name of highlight.names) {
            highlightMap[name] = highlightFn;
        }
    }
    return highlightMap;
}


/**
 * Generate a syntax-highlighed code block element model
 *
 * @param {?Object} highlightRegex - The compiled highlight model regex
 * @param {string[]} lines - The code block lines
 * @param {?Object} [options] - The [options object]{@link module:lib/elements~MarkdownElementsOptions}
 * @returns {*} The syntax-highlighted code [element model]{@link https://github.com/craigahobbs/element-model#readme}
 *
 * @ignore
 */
function highlightElements(highlightRegex, lines, options = null) {
    // Join the text lines
    let text = lines.map((line) => (line.endsWith('\n') ? line : `${line}\n`)).join('');

    // The copy link elements
    const copyElements = options === null || !('copyFn' in options) ? null : {
        'html': 'p', 'attr': {'style': 'cursor: pointer; font-size: 0.85em; text-align: right; user-select: none;'}, 'elem': {
            'html': 'a', 'elem': {'text': 'Copy'}, 'callback': (element) => {
                element.addEventListener('click', () => {
                    options.copyFn(`${lines.join('\n')}\n`);
                }, false);
            }
        }
    };
    const preAttr = (copyElements !== null ? {'style': 'margin-top: 0.25em'} : null);

    // No language specified or unknown language?
    if (highlightRegex === null) {
        return [
            copyElements,
            {'html': 'pre', 'attr': preAttr, 'elem': {'html': 'code', 'elem': {'text': text}}}
        ];
    }

    // Match the highlight spans
    const spans = [];
    const rHighlight = highlightRegex.highlight;
    while (true) {
        const mHighlight = rHighlight.exec(text);
        if (mHighlight === null) {
            break;
        }
        const [highlightText] = mHighlight;

        // Add the pre-text span
        if (mHighlight.index > 0) {
            spans.push({'text': text.slice(0, mHighlight.index)});
        }

        // Determine the highlight color
        let color;
        for (const memberName of getStructMembers(highlightTypes, highlightTypes.Highlight.struct).map((member) => member.name)) {
            if (memberName in highlightRegex && highlightRegex[memberName].test(highlightText)) {
                color = `var(--markdown-model-color-highlight-${memberName})`;
                break;
            }
        }

        // Add the highlight span
        spans.push({
            'html': 'span',
            'attr': {'style': `color: ${color};`},
            'elem': {'text': highlightText}
        });

        // Advance past the highlight match
        text = text.slice(mHighlight.index + highlightText.length);
    }

    // Add the final un-matched text
    if (text) {
        spans.push({'text': text});
    }

    // Create the code block elements
    return [
        copyElements,
        {'html': 'pre', 'attr': preAttr, 'elem': {'html': 'code', 'elem': spans}}
    ];
}


// The syntax-highlight model
export const highlightTypes = parseSchemaMarkdown(`\
group "Syntax Highlighting"


# Code syntax-highlighting model
struct Highlight
    # The language names/aliases. The first name is the preferred name.
    string[len > 0] names

    # Built-in regular expressions
    optional string[len > 0] builtin

    # Comment regular expressions
    optional string[len > 0] comment

    # Keyword regular expressions
    optional string[len > 0] keyword

    # Literal regular expressions
    optional string[len > 0] literal

    # Preprocessor regular expressions
    optional string[len > 0] preprocessor

    # String regular expressions
    optional string[len > 0] string

    # Tag regular expressions
    optional string[len > 0] tag
`);


// Helper to create a word list regular expression
function createWordListRegex(...words) {
    return `\\b(?:${words.map((str) => escapeMarkdownText(str)).join('|')})\\b`;
}


// Common regular expression source
const rCommentHash = '#.*$';
const rCommentSlashSlash = '\\/\\/.*$';
const rCommentSlashStar = '\\/\\*[\\s\\S]*?\\*\\/';
const rNumber = '(?:\\b|[+-])\\d+(?:\\.\\d*)?(?:e[+-]\\d+)?\\b';
const rStringSingle = "'(?:[^'\\\\]|\\\\.)*'";
const rStringDouble = '"(?:[^"\\\\]|\\\\.)*"';


// The map of code block language name/alias to code block render functions
const highlightBuiltin = compileHighlightModels([
    // BareScript
    {
        'names': ['barescript', 'bare-script', 'markdown-script'],
        'builtin': [
            createWordListRegex(
                'arrayCopy', 'arrayExtend', 'arrayGet', 'arrayIndexOf', 'arrayJoin', 'arrayLastIndexOf', 'arrayLength',
                'arrayNew', 'arrayNewSize', 'arrayPop', 'arrayPush', 'arraySet', 'arrayShift', 'arraySlice',
                'arraySort', 'dataAggregate', 'dataCalculatedField', 'dataFilter', 'dataJoin', 'dataLineChart',
                'dataParseCSV', 'dataSort', 'dataTable', 'dataTop', 'dataValidate', 'datetimeDay', 'datetimeHour',
                'datetimeISOFormat', 'datetimeISOParse', 'datetimeMillisecond', 'datetimeMinute', 'datetimeMonth',
                'datetimeNew', 'datetimeNow', 'datetimeSecond', 'datetimeToday', 'datetimeYear', 'documentFontSize',
                'documentInputValue', 'documentSetFocus', 'documentSetReset', 'documentSetTitle', 'documentURL',
                'drawArc', 'drawCircle', 'drawClose', 'drawEllipse', 'drawHLine', 'drawHeight', 'drawImage', 'drawLine',
                'drawMove', 'drawNew', 'drawOnClick', 'drawPathRect', 'drawRect', 'drawStyle', 'drawText',
                'drawTextHeight', 'drawTextStyle', 'drawTextWidth', 'drawVLine', 'drawWidth', 'elementModelRender',
                'jsonParse', 'jsonStringify', 'localStorageClear', 'localStorageGet', 'localStorageRemove',
                'localStorageSet', 'markdownEscape', 'markdownHeaderId', 'markdownParse', 'markdownPrint',
                'markdownTitle', 'mathAbs', 'mathAcos', 'mathAsin', 'mathAtan', 'mathAtan2', 'mathCeil', 'mathCos',
                'mathFloor', 'mathLn', 'mathLog', 'mathMax', 'mathMin', 'mathPi', 'mathRandom', 'mathRound', 'mathSign',
                'mathSin', 'mathSqrt', 'mathTan', 'numberParseFloat', 'numberParseInt', 'numberToFixed', 'objectAssign',
                'objectCopy', 'objectDelete', 'objectGet', 'objectHas', 'objectKeys', 'objectNew', 'objectSet',
                'regexEscape', 'regexMatch', 'regexMatchAll', 'regexNew', 'regexReplace', 'regexSplit',
                'schemaElements', 'schemaParse', 'schemaParseEx', 'schemaTypeModel', 'schemaValidate',
                'schemaValidateTypeModel', 'sessionStorageClear', 'sessionStorageGet', 'sessionStorageRemove',
                'sessionStorageSet', 'stringCharCodeAt', 'stringEndsWith', 'stringFromCharCode', 'stringIndexOf',
                'stringLastIndexOf', 'stringLength', 'stringLower', 'stringNew', 'stringRepeat', 'stringReplace',
                'stringSlice', 'stringSplit', 'stringStartsWith', 'stringTrim', 'stringUpper', 'systemBoolean',
                'systemCompare', 'systemFetch', 'systemGlobalGet', 'systemGlobalSet', 'systemIs', 'systemLog',
                'systemLogDebug', 'systemPartial', 'systemType', 'urlEncode', 'urlEncodeComponent', 'urlObjectCreate',
                'windowHeight', 'windowSetLocation', 'windowSetResize', 'windowSetTimeout', 'windowWidth'
            )
        ],
        'comment': [rCommentHash],
        'keyword': [
            createWordListRegex(
                'async', 'break', 'continue', 'else', 'elif', 'endfor', 'endfunction', 'endif', 'endwhile', 'for',
                'function', 'if', 'in', 'include', 'jump', 'jumpif', 'return', 'while'
            )
        ],
        'literal': [createWordListRegex('true', 'false', 'null'), rNumber],
        'string': [rStringSingle, rStringDouble]
    },

    // C
    {
        'names': ['c'],
        'builtin': [
            createWordListRegex(
                'abs', 'atof', 'atoi', 'bsearch', 'calloc', 'clock', 'div', 'exit', 'fclose', 'feof', 'fopen',
                'fprintf', 'fread', 'free', 'fscanf', 'fseek', 'ftell', 'fwrite', 'isalnum', 'isalpha', 'isdigit',
                'islower', 'isupper', 'malloc', 'memcpy', 'memmove', 'memset', 'perror', 'printf', 'qsort', 'rand',
                'realloc', 'rewind', 'scanf', 'snprintf', 'sprintf', 'srand', 'sscanf', 'strcat', 'strchr', 'strcmp',
                'strcpy', 'strlen', 'strncat', 'strncmp', 'strncpy', 'strstr', 'strtod', 'strtof', 'strtol', 'strtoll',
                'strtoul', 'strtoull', 'system', 'time', 'tolower', 'toupper', 'vsnprintf'
            )
        ],
        'comment': [rCommentSlashSlash, rCommentSlashStar],
        'keyword': [
            createWordListRegex(
                'auto', 'bool', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
                'extern', 'float', 'for', 'goto', 'if', 'inline', 'int', 'long', 'register', 'restrict', 'return',
                'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union', 'unsigned', 'void',
                'volatile', 'while', '_Alignas', '_Alignof', '_Atomic', '_Bool', '_Complex', '_Generic', '_Imaginary',
                '_Noreturn', '_Static_assert', '_Thread_local'
            )
        ],
        'literal': [createWordListRegex('true', 'false', 'NULL'), rNumber],
        'preprocessor': [
            '^[ \\t]*#(?:define|include|ifdef|ifndef|endif|if|else|elif|undef|pragma|error|warning|line)\\b'
        ],
        'string': [rStringSingle, rStringDouble]
    },

    // C++
    {
        'names': ['c++', 'cpp'],
        'builtin': [
            createWordListRegex(
                'accumulate', 'advance', 'algorithm', 'all_of', 'any_of', 'array', 'async', 'begin', 'bind', 'bitset',
                'cbegin', 'cend', 'cerr', 'chrono', 'cin', 'clog', 'cmath', 'condition_variable', 'copy', 'cout',
                'cref', 'cstdio', 'cstdlib', 'cstring', 'deque', 'distance', 'duration', 'end', 'equal_range',
                'exception', 'fill', 'find', 'find_if', 'forward', 'function', 'future', 'get', 'initializer_list',
                'invalid_argument', 'iostream', 'list', 'lock_guard', 'logic_error', 'lower_bound', 'make_pair',
                'make_tuple', 'map', 'max', 'max_element', 'mem_fn', 'min', 'min_element', 'move', 'mutex', 'next',
                'none_of', 'out_of_range', 'packaged_task', 'pair', 'prev', 'priority_queue', 'promise', 'queue',
                'ratio', 'recursive_mutex', 'ref', 'remove', 'remove_if', 'reverse', 'runtime_error', 'set',
                'shared_ptr', 'sort', 'stack', 'std', 'stod', 'stof', 'stoi', 'stol', 'stold', 'stoll', 'stoul',
                'stoull', 'string', 'swap', 'system_error', 'this_thread', 'thread', 'tie', 'time_point', 'to_string',
                'transform', 'tuple', 'unique', 'unique_lock', 'unique_ptr', 'unordered_map', 'unordered_set',
                'upper_bound', 'vector', 'wcerr', 'wcin', 'wclog', 'wcout', 'weak_ptr'
            )
        ],
        'comment': [rCommentSlashSlash, rCommentSlashStar],
        'keyword': [
            createWordListRegex(
                'alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor', 'bool', 'break', 'case',
                'catch', 'char', 'char8_t', 'char16_t', 'char32_t', 'class', 'compl', 'concept', 'const', 'consteval',
                'constexpr', 'constinit', 'const_cast', 'continue', 'co_await', 'co_return', 'co_yield', 'decltype',
                'default', 'delete', 'do', 'double', 'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern',
                'false', 'float', 'for', 'friend', 'goto', 'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new',
                'noexcept', 'not', 'not_eq', 'nullptr', 'operator', 'or', 'or_eq', 'private', 'protected', 'public',
                'reflexpr', 'register', 'reinterpret_cast', 'requires', 'return', 'short', 'signed', 'sizeof', 'static',
                'static_assert', 'static_cast', 'struct', 'switch', 'synchronized', 'template', 'this', 'thread_local',
                'throw', 'true', 'try', 'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual',
                'void', 'volatile', 'wchar_t', 'while', 'xor', 'xor_eq'
            )
        ],
        'literal': [createWordListRegex('true', 'false', 'NULL'), rNumber],
        'preprocessor': [
            '^[ \\t]*#(?:define|include|ifdef|ifndef|endif|if|else|elif|undef|pragma|error|warning|line)\\b'
        ],
        'string': [rStringSingle, rStringDouble, 'R"(?<cppRaw>[^\\s]*)\\((?:[\\s\\S]*?)\\)\\k<cppRaw>"']
    },

    // C#
    {
        'names': ['c#', 'csharp', 'cake', 'cakescript'],
        'builtin': [
            createWordListRegex(
                'Array', 'BitConverter', 'Boolean', 'Byte', 'Char', 'Console', 'DateTime', 'DateTimeOffset', 'Decimal',
                'Delegate', 'Double', 'Enum', 'Exception', 'GC', 'Guid', 'Int16', 'Int32', 'Int64', 'Math', 'Object', 'Random',
                'SByte', 'Single', 'String', 'StringBuilder', 'TimeSpan', 'UInt16', 'UInt32', 'UInt64', 'Void'
            )
        ],
        'comment': [rCommentSlashSlash, rCommentSlashStar],
        'keyword': [
            createWordListRegex(
                'abstract', 'add', 'alias', 'as', 'ascending', 'async', 'await', 'base', 'bool', 'break', 'byte', 'by',
                'case', 'catch', 'char', 'checked', 'class', 'const', 'continue', 'decimal', 'default', 'delegate',
                'descending', 'do', 'double', 'dynamic', 'else', 'enum', 'equals', 'event', 'explicit', 'extern',
                'finally', 'fixed', 'float', 'for', 'foreach', 'from', 'get', 'global', 'goto', 'group', 'if',
                'implicit', 'in', 'int', 'interface', 'internal', 'into', 'is', 'join', 'let', 'lock', 'long',
                'namespace', 'nameof', 'new', 'object', 'on', 'operator', 'orderby', 'out', 'override', 'params',
                'partial', 'private', 'protected', 'public', 'readonly', 'ref', 'remove', 'return', 'sbyte', 'sealed',
                'select', 'set', 'short', 'sizeof', 'stackalloc', 'static', 'string', 'struct', 'switch', 'this',
                'throw', 'try', 'typeof', 'uint', 'ulong', 'unchecked', 'unsafe', 'ushort', 'using', 'value', 'var',
                'virtual', 'void', 'volatile', 'when', 'where', 'while', 'yield'
            )
        ],
        'literal': [createWordListRegex('true', 'false', 'null'), rNumber],
        'preprocessor': [
            '^[ \\t]*#(?:define|elif|else|endif|error|if|line|pragma|region|endregion|undef|warning)\\b'
        ],
        'string': ['@"(?:[^"]|"")*"', rStringSingle, rStringDouble]
    },

    // Go
    {
        'names': ['go', 'golang'],
        'builtin': [
            createWordListRegex(
                'append', 'cap', 'close', 'complex', 'copy', 'delete', 'imag', 'len', 'make', 'new', 'panic', 'print',
                'println', 'real', 'recover'
            )
        ],
        'comment': [rCommentSlashSlash, rCommentSlashStar],
        'keyword': [
            createWordListRegex(
                'bool', 'break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else', 'fallthrough', 'for',
                'func', 'go', 'goto', 'if', 'import', 'interface', 'int', 'int8', 'int16', 'int32', 'int64', 'map',
                'package', 'range', 'return', 'select', 'struct', 'switch', 'type', 'uint', 'uint8', 'uint16', 'uint32',
                'uint64', 'uintptr', 'var'
            )
        ],
        'literal': [createWordListRegex('false', 'iota', 'nil', 'true'), rNumber, rStringSingle],
        'string': [rStringDouble, '`[^`]*`']
    },

    // HTML
    {
        'names': ['html', 'xhtml'],
        'comment': ['<!--[\\s\\S]*?-->'],
        'literal': ['&#[0-9]+;', '&(?:amp|apos|copy|eacute|hellip|gt|lt|mdash|nbsp|quot|reg|rsquo|sect|semi|szlig|uuml);'],
        'preprocessor': [
            '<!DOCTYPE[^>]*>',
            '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'
        ],
        'string': [rStringSingle, rStringDouble],
        'tag': ['<\\/?\\s*(?:[A-Za-z_][A-Za-z0-9_.:-]*)']
    },

    // Java
    {
        'names': ['java'],
        'builtin': [
            createWordListRegex(
                'Appendable', 'AutoCloseable', 'Boolean', 'Byte', 'CharSequence', 'Character', 'Class', 'ClassLoader',
                'ClassValue', 'Cloneable', 'Comparable', 'Compiler', 'Double', 'Enum', 'Float',
                'InheritableThreadLocal', 'Integer', 'Iterable', 'Long', 'Math', 'Number', 'Object', 'Package',
                'Process', 'ProcessBuilder', 'Readable', 'Runnable', 'Runtime', 'RuntimePermission', 'SecurityManager',
                'Short', 'StackTraceElement', 'StrictMath', 'String', 'StringBuffer', 'StringBuilder', 'System',
                'Thread', 'ThreadGroup', 'ThreadLocal', 'Throwable', 'Void'
            )
        ],
        'comment': [rCommentSlashSlash, rCommentSlashStar],
        'keyword': [
            createWordListRegex(
                'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue',
                'default', 'do', 'double', 'else', 'enum', 'exports', 'extends', 'final', 'finally', 'float', 'for',
                'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'module', 'native',
                'new', 'open', 'opens', 'package', 'private', 'protected', 'public', 'requires', 'return', 'short',
                'static', 'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient',
                'transitive', 'try', 'uses', 'var', 'void', 'volatile', 'while'
            )
        ],
        'literal': [createWordListRegex('true', 'false', 'null'), rNumber],
        'preprocessor': ['@\\w+'],
        'string': ['"""[\\s\\S]*?"""', rStringSingle, rStringDouble]
    },

    // JavaScript (ES6)
    {
        'names': ['javascript', 'js', 'node'],
        'builtin': [
            createWordListRegex(
                'Array', 'ArrayBuffer', 'Boolean', 'console', 'DataView', 'Date', 'decodeURI', 'decodeURIComponent',
                'encodeURI', 'encodeURIComponent', 'Error', 'EvalError', 'Float32Array', 'Float64Array', 'Function',
                'Infinity', 'Int8Array', 'Int16Array', 'Int32Array', 'isFinite', 'isNaN', 'JSON', 'Map', 'Math', 'NaN',
                'Number', 'Object', 'parseFloat', 'parseInt', 'Promise', 'Proxy', 'RangeError', 'ReferenceError',
                'Reflect', 'RegExp', 'Set', 'String', 'Symbol', 'SyntaxError', 'TypeError', 'Uint8Array',
                'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'URIError', 'WeakMap', 'WeakSet'
            )
        ],
        'comment': [rCommentSlashSlash, rCommentSlashStar],
        'keyword': [
            createWordListRegex(
                'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else',
                'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new',
                'return', 'super', 'switch', 'static', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with',
                'yield'
            )
        ],
        'literal': [createWordListRegex('true', 'false', 'null', 'undefined'), rNumber],
        'string': [rStringSingle, rStringDouble, '`(?:[^`\\\\]|\\\\[\\s\\S])*`']
    },

    // JSON
    {
        'names': ['json'],
        'literal': [createWordListRegex('true', 'false', 'null'), rNumber],
        'string': [rStringDouble]
    },

    // Makefile
    {
        'names': ['makefile', 'make', 'mf', 'bsdmake'],
        'builtin': [
            createWordListRegex(
                'abspath', 'addprefix', 'addsuffix', 'and', 'basename', 'call', 'dir', 'error', 'eval', 'file',
                'filter', 'filter-out', 'findstring', 'firstword', 'foreach', 'guile', 'if', 'info', 'join', 'lastword',
                'notdir', 'or', 'origin', 'patsubst', 'realpath', 'shell', 'sort', 'strip', 'subst', 'suffix', 'value',
                'warning', 'wildcard', 'word', 'wordlist', 'words',
            ),

            // Automatic variables
            '\\$[@<^+?*%|]',
            '\\$\\([@<^+?*%][DF]\\)'
        ],
        'comment': [rCommentHash],
        'keyword': [
            createWordListRegex(
                'define', 'else', 'endef', 'endif', 'export', 'ifdef', 'ifeq', 'ifndef', 'ifneq', 'include', 'override',
                'unexport', 'vpath'
            )
        ],
        'preprocessor': [
            `^ *\\.(?:${[
                'PHONY', 'SUFFIXES', 'DEFAULT', 'PRECIOUS', 'INTERMEDIATE', 'SECONDARY', 'SECONDEXPANSION',
                'DELETE_ON_ERROR', 'LOW_RESOLUTION_TIME', 'SILENT', 'EXPORT_ALL_VARIABLES', 'IGNORE', 'POSIX', 'MAKE',
                'NOTPARALLEL', 'ONESHELL', 'RECIPEPREFIX',

                // Makefile special target names are case-insensitive so include lowercase versions
                'phony', 'suffixes', 'default', 'precious', 'intermediate', 'secondary', 'secondexpansion',
                'delete_on_error', 'low_resolution_time', 'silent', 'export_all_variables', 'ignore', 'posix', 'make',
                'notparallel', 'oneshell', 'recipeprefix'
            ].join('|')}) *:`
        ],
        'string': [rStringSingle, rStringDouble],
        'tag': ['^ *[A-Za-z0-9_\\-][A-Za-z0-9_\\-/.]* *:(?!=)']
    },

    // Markdown
    {
        'names': ['markdown', 'md'],
        'literal': [
            // Fenced code blocks
            '^(?<mdFence> *(?:`{3,}|~{3,}))[\\s\\S]+?\\n\\k<mdFence> *$'
        ],
        'string': [
            // List bullets
            '^[ \\t]*[-+*]\\s',
            '^[ \\t]*\\d+\\.\\s',

            // Links
            '\\[(?:[^\\]]+)\\]\\((?:[^)\\s]+)(?:\\s+"[^"]+")?\\)'
        ],
        'tag': [
            // Titles
            '^ *#.*$'
        ]
    },

    // Python
    {
        'names': ['python', 'python3'],
        'builtin': [
            createWordListRegex(
                '__import__', 'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'breakpoint', 'bytearray', 'bytes',
                'callable', 'chr', 'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir', 'divmod', 'enumerate',
                'eval', 'exec', 'filter', 'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash',
                'help', 'hex', 'id', 'input', 'int', 'isinstance', 'issubclass', 'iter', 'len', 'list', 'locals', 'map',
                'max', 'memoryview', 'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print', 'property', 'range',
                'repr', 'reversed', 'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str', 'sum', 'super',
                'tuple', 'type', 'vars', 'zip'
            )
        ],
        'comment': [rCommentHash],
        'keyword': [
            createWordListRegex(
                'and', 'as', 'assert', 'async', 'await', 'break', 'case', 'class', 'continue', 'def', 'del', 'elif',
                'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'match',
                'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'
            )
        ],
        'literal': [createWordListRegex('False', 'True', 'None'), rNumber],
        'string': ["'''[\\s\\S]*?'''", '"""[\\s\\S]*?"""', rStringSingle, rStringDouble]
    },

    // Rust
    {
        'names': ['rust', 'rs'],
        'builtin': [
            createWordListRegex(
                'AsMut', 'AsRef', 'Box', 'Clone', 'Copy', 'Default', 'Drop', 'Err', 'ExactSizeIterator', 'Extend', 'Fn',
                'FnMut', 'FnOnce', 'From', 'Iterator', 'None', 'Ok', 'Option', 'Ord', 'PartialEq', 'PartialOrd',
                'Result', 'Send', 'Sized', 'Some', 'String', 'Sync', 'ToOwned', 'Vec', 'assert', 'assert_eq',
                'assert_ne', 'cfg', 'column', 'concat', 'concat_idents', 'debug_assert', 'debug_assert_eq',
                'debug_assert_ne', 'env', 'eprint', 'eprintln', 'file', 'format', 'format_args', 'include',
                'include_bytes', 'include_str', 'line', 'module_path', 'option_env', 'panic', 'print', 'println',
                'stringify', 'thread_local', 'todo', 'unimplemented', 'unreachable', 'vec', 'write', 'writeln'
            )
        ],
        'comment': [rCommentSlashSlash, rCommentSlashStar],
        'keyword': [
            createWordListRegex(
                'Self', 'abstract', 'as', 'async', 'await', 'become', 'bool', 'box', 'break', 'char', 'const',
                'continue', 'crate', 'do', 'dyn', 'else', 'enum', 'extern', 'final', 'fn', 'for', 'f32', 'f64', 'if',
                'impl', 'in', 'i128', 'i16', 'i32', 'i64', 'i8', 'int', 'isize', 'let', 'loop', 'macro', 'match', 'mod',
                'move', 'mut', 'override', 'priv', 'pub', 'ref', 'return', 'self', 'static', 'str', 'struct', 'super',
                'trait', 'try', 'type', 'typeof', 'u128', 'u16', 'u32', 'u64', 'u8', 'uint', 'unsafe', 'unsized', 'use',
                'usize', 'virtual', 'where', 'while', 'yield'
            )
        ],
        'literal': [createWordListRegex('false', 'true'), rNumber],
        'preprocessor': ['#\\!?\\[.*?\\]'],
        'string': [
            rStringSingle,
            rStringDouble,
            'b"(?:[^"\\\\]|\\\\.)*"',
            'br"(?:[^"])*"',
            'br#"(?:[^"]|"(?!#))*"#',
            'br##"(?:[^"]|"(?!##))*"##',
            'r"(?:[^"])*"',
            'r#"(?:[^"]|"(?!#))*"#',
            'r##"(?:[^"]|"(?!##))*"##'
        ]
    },

    // Schema Markdown
    {
        'names': ['schema-markdown'],
        'builtin': [
            createWordListRegex('bool', 'date', 'datetime', 'float', 'int', 'object', 'string', 'uuid')
        ],
        'comment': [rCommentHash],
        'keyword': [
            createWordListRegex(
                'action', 'enum', 'errors', 'group', 'input', 'nullable', 'optional', 'output', 'path', 'query',
                'struct', 'typedef', 'union', 'urls'
            )
        ],
        'string': [rStringDouble]
    },

    // Shell
    {
        'names': ['shell', 'sh', 'bash', 'zsh'],
        'builtin': [
            createWordListRegex('alias', 'declare', 'echo', 'exit', 'export', 'let', 'set', 'unset')
        ],
        'comment': [rCommentHash],
        'keyword': [
            createWordListRegex(
                'break', 'case', 'continue', 'do', 'done', 'elif', 'else', 'esac', 'fi', 'for', 'function', 'if', 'in',
                'return', 'then', 'until', 'while'
            )
        ],
        'string': [rStringSingle, rStringDouble]
    },

    // SQL
    {
        'names': ['sql', 'plsql', 'tsql'],
        'builtin': [
            createWordListRegex(
                'ABS', 'ACOS', 'ASIN', 'ATAN', 'ATAN2', 'AVG', 'BIGINT', 'BINARY', 'BLOB', 'BOOLEAN', 'CAST', 'CEIL',
                'CEILING', 'CHAR', 'COALESCE', 'CONCAT', 'COS', 'COUNT', 'CURRENT_DATE', 'CURRENT_TIME',
                'CURRENT_TIMESTAMP', 'DATE', 'DATETIME', 'DECIMAL', 'DOUBLE', 'EXP', 'FLOAT', 'FLOOR', 'INT', 'INTEGER',
                'LENGTH', 'LN', 'LOG', 'LOG10', 'LOWER', 'MAX', 'MIN', 'NCHAR', 'NOW', 'NUMERIC', 'PI', 'POWER', 'RAND',
                'REAL', 'ROUND', 'SIN', 'SMALLINT', 'SQRT', 'SUM', 'TAN', 'TEXT', 'TIME', 'TIMESTAMP', 'TRIM', 'UPPER',
                'VARCHAR',

                // SQL builtins are case-insensitive so include lowercase versions
                'abs', 'acos', 'asin', 'atan', 'atan2', 'avg', 'bigint', 'binary', 'blob', 'boolean', 'cast', 'ceil',
                'ceiling', 'char', 'coalesce', 'concat', 'cos', 'count', 'current_date', 'current_time',
                'current_timestamp', 'date', 'datetime', 'decimal', 'double', 'exp', 'float', 'floor', 'int', 'integer',
                'length', 'ln', 'log', 'log10', 'lower', 'max', 'min', 'nchar', 'now', 'numeric', 'pi', 'power', 'rand',
                'real', 'round', 'sin', 'smallint', 'sqrt', 'sum', 'tan', 'text', 'time', 'timestamp', 'trim', 'upper',
                'varchar'
            )
        ],
        'comment': ['--.*$', rCommentSlashStar],
        'keyword': [
            createWordListRegex(
                'ADD', 'ALL', 'ALTER', 'AND', 'AS', 'ASC', 'BETWEEN', 'CASE', 'CHECK', 'CREATE', 'DATABASE', 'DELETE',
                'DESC', 'DISTINCT', 'DROP', 'EXISTS', 'FROM', 'GROUP', 'HAVING', 'IN', 'INSERT', 'INTO', 'IS', 'JOIN',
                'LIKE', 'LIMIT', 'NOT', 'NULL', 'ON', 'OR', 'ORDER', 'SELECT', 'SET', 'TABLE', 'UNION', 'UPDATE',
                'VALUES', 'WHERE',

                // SQL builtins are case-insensitive so include lowercase versions
                'add', 'all', 'alter', 'and', 'as', 'asc', 'between', 'case', 'check', 'create', 'database', 'delete',
                'desc', 'distinct', 'drop', 'exists', 'from', 'group', 'having', 'in', 'insert', 'into', 'is', 'join',
                'like', 'limit', 'not', 'null', 'on', 'or', 'order', 'select', 'set', 'table', 'union', 'update',
                'values', 'where'
            )
        ],
        'literal': [createWordListRegex('FALSE', 'NULL', 'TRUE'), rNumber],
        'string': ["'(?:[^']|'')*'"]
    },

    // Swift
    {
        'names': ['swift'],
        'builtin': [
            createWordListRegex(
                'abs', 'acos', 'asin', 'assert', 'atan', 'atan2', 'cos', 'cosh', 'debugPrint', 'dump', 'exp', 'exp2',
                'fabs', 'fatalError', 'floor', 'fmod', 'log', 'log10', 'log2', 'max', 'min', 'numericCast', 'pow',
                'precondition', 'print', 'readLine', 'reduce', 'round', 'sin', 'sinh', 'sort', 'sqrt', 'stride', 'swap',
                'tan', 'tanh', 'type(of)', 'unsafeBitCast', 'withUnsafeBytes', 'withUnsafePointer', 'zip'
            )
        ],
        'comment': [rCommentSlashSlash, rCommentSlashStar],
        'keyword': [
            createWordListRegex(
                'Any', 'AnyClass', 'AnyObject', 'Array', 'ArraySlice', 'Bool', 'Character', 'ClosedRange', 'Dictionary',
                'Double', 'Error', 'Float', 'Float80', 'Int', 'Int16', 'Int32', 'Int64', 'Int8', 'Never', 'Optional',
                'Range', 'Self', 'Set', 'String', 'Substring', 'Type', 'UInt', 'UInt16', 'UInt32', 'UInt64', 'UInt8',
                'UnsafeBufferPointer', 'UnsafeMutableBufferPointer', 'UnsafeMutablePointer',
                'UnsafeMutableRawBufferPointer', 'UnsafeMutableRawPointer', 'UnsafePointer', 'UnsafeRawBufferPointer',
                'UnsafeRawPointer', 'Void', 'as', 'associatedtype', 'associativity', 'break', 'case', 'catch', 'class',
                'continue', 'convenience', 'default', 'defer', 'deinit', 'didSet', 'do', 'dynamic', 'else', 'enum',
                'extension', 'fallthrough', 'fileprivate', 'final', 'for', 'func', 'get', 'guard', 'if', 'import', 'in',
                'indirect', 'infix', 'init', 'inout', 'internal', 'is', 'lazy', 'left', 'let', 'mutating', 'none',
                'nonmutating', 'open', 'operator', 'optional', 'override', 'postfix', 'precedence', 'prefix', 'private',
                'protocol', 'public', 'rethrows', 'required', 'return', 'right', 'self', 'set', 'static', 'struct',
                'subscript', 'super', 'switch', 'throw', 'throws', 'try', 'typealias', 'unowned', 'var', 'weak',
                'where', 'while', 'willSet'
            )
        ],
        'literal': [createWordListRegex('false', 'nil', 'true'), rNumber],
        'preprocessor': [
            `#(?:${[
                'available', 'colorLiteral', 'column', 'dsohandle', 'else', 'elseif', 'endif', 'error', 'file',
                'fileID', 'fileLiteral', 'filePath', 'function', 'if', 'imageLiteral', 'keyPath', 'line', 'selector',
                'sourceLocation', 'warning'
            ].join('|')})\\b`
        ],
        'string': ['"""[\\s\\S]*?"""', rStringDouble]
    },

    // TypeScript
    {
        'names': ['typescript', 'ts'],
        'builtin': [
            createWordListRegex(
                'AbortController', 'AbortSignal', 'Array', 'ArrayBuffer', 'AsyncGenerator', 'AsyncGeneratorFunction',
                'AsyncIterable', 'AsyncIterableIterator', 'Atomics', 'Awaited', 'BigInt', 'BigInt64Array',
                'BigUint64Array', 'Boolean', 'Capitalize', 'DataView', 'Date', 'Error', 'EvalError', 'Exclude',
                'Extract', 'Float32Array', 'Float64Array', 'Function', 'Generator', 'GeneratorFunction', 'Infinity',
                'InstanceType', 'Int16Array', 'Int32Array', 'Int8Array', 'Intl', 'JSON', 'Lowercase', 'Map', 'Math',
                'NaN', 'NonNullable', 'Number', 'Object', 'Omit', 'Parameters', 'Partial', 'Pick', 'Promise', 'Proxy',
                'RangeError', 'Readonly', 'Record', 'ReferenceError', 'Reflect', 'RegExp', 'Required', 'ReturnType',
                'Set', 'SharedArrayBuffer', 'String', 'Symbol', 'SyntaxError', 'ThisType', 'TypeError', 'URIError',
                'Uint16Array', 'Uint32Array', 'Uint8Array', 'Uint8ClampedArray', 'Uncapitalize', 'Uppercase', 'WeakMap',
                'WeakSet', 'console'
            )
        ],
        'comment': [rCommentSlashSlash, rCommentSlashStar],
        'keyword': [
            createWordListRegex(
                'abstract', 'any', 'as', 'asserts', 'async', 'await', 'boolean', 'break', 'case', 'catch', 'class',
                'const', 'constructor', 'continue', 'debugger', 'declare', 'default', 'delete', 'do', 'else', 'enum',
                'export', 'extends', 'finally', 'for', 'from', 'function', 'get', 'global', 'if', 'implements',
                'import', 'in', 'infer', 'instanceof', 'interface', 'is', 'keyof', 'let', 'module', 'namespace',
                'never', 'new', 'of', 'package', 'private', 'protected', 'public', 'readonly', 'require', 'return',
                'set', 'static', 'super', 'switch', 'this', 'throw', 'try', 'type', 'typeof', 'unique', 'unknown',
                'var', 'void', 'while', 'with', 'yield'
            )
        ],
        'literal': [createWordListRegex('true', 'false', 'null', 'undefined'), rNumber],
        'preprocessor': ['@\\w+'],
        'string': [rStringSingle, rStringDouble, '`(?:[^`\\\\]|\\\\[\\s\\S])*`']
    },

    // XML
    {
        'names': ['xml', 'rss', 'xsd', 'wsdl'],
        'comment': ['<!--[\\s\\S]*?-->'],
        'literal': ['&#[0-9]+;', '&(?:amp|apos|gt|lt|quot);'],
        'preprocessor': [
            '<\\?.*?\\?>',
            '<!DOCTYPE[^>]*>',
            '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'
        ],
        'string': [rStringSingle, rStringDouble],
        'tag': ['<\\/?\\s*(?:[A-Za-z_][A-Za-z0-9_.:-]*)']
    }
]);
