// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-model/blob/main/LICENSE

/** @module lib/highlight */

import {parseSchemaMarkdown} from '../../schema-markdown/lib/parser.js';
import {validateType} from '../../schema-markdown/lib/schema.js';


/**
 * Generate a syntax-highlighed code block element model
 *
 * @property {string?} language - The code block language
 * @property {string[]} lines - The code block lines
 * @returns {*} The syntax-highlighted code [element model]{@link https://github.com/craigahobbs/element-model#readme}
 */
export function highlightElements(languageArg, lines) {
    // Get the highlight regex
    let language = (languageArg !== null ? languageArg.toLowerCase() : null);
    let regex = null;
    if (language !== null) {
        regex = highlightRegex[language] ?? null;
        if (regex === null) {
            language = highlightAliases[language];
            if (language !== null) {
                regex = highlightRegex[language] ?? null;
            }
        }
    }

    // Join the text lines
    let text = lines.map((line) => (line.endsWith('\n') ? line : `${line}\n`)).join('');

    // No language specified or unknown language?
    if (regex === null) {
        return {'html': 'pre', 'elem': {'html': 'code', 'elem': {'text': text}}};
    }

    // Match the highlight spans
    const spans = [];
    const rHighlight = regex.highlight;
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
        let color = 'var(--markdown-model-color-highlight-string)';
        for (const member of ['builtin', 'keyword', 'literal', 'comment']) {
            if (member in regex && regex[member].test(highlightText)) {
                color = `var(--markdown-model-color-highlight-${member})`;
            }
        }

        // Add the highlight span
        spans.push({
            'html': 'span',
            'attr': {'style': `color: ${color};`},
            'elem': {'text': text.slice(mHighlight.index, mHighlight.index + highlightText.length)}
        });

        // Advance past the highlight match
        text = text.slice(mHighlight.index + highlightText.length);
    }

    // Add the final un-matched text
    if (text) {
        spans.push({'text': text});
    }

    // Create the code block elements
    return {'html': 'pre', 'elem': {'html': 'code', 'elem': spans}};
}


// The syntax-highlight model
const highlightTypes = parseSchemaMarkdown(`\
# Code block language to highlight model map
typedef Highlight{} HighlightMap


# Code syntax-highlighting model
struct Highlight

    # The built-in function names
    optional string[] builtin

    # The comment regular expressions
    optional string[] comment

    # The language's keywords
    optional string[] keyword

    # The literal regular expressions
    optional string[] literal

    # The string regular expressions
    optional string[] string
`);


// Common regular expression source
const rBoolean = '\\b(?:false|true)\\b';
const rCommentHash = '#[^\\n\\r]*';
const rCommentSlashSlash = '\\/\\/[^\\n\\r]*';
const rCommentSlashStar = '\\/\\*[\\s\\S]*?\\*\\/';
const rNumber = '(?:\\b|[+-]?)\\d+(?:\\.\\d*)?(?:e[+-]\\d+)?\\b';
const rNull = '\\bnull\\b';
const rStringSingle = "'(?:[^'\\\\]|\\\\.)*'";
const rStringDouble = '"(?:[^"\\\\]|\\\\.)*"';


// The code block language to highlight model map
const highlightLanguages = validateType(highlightTypes, 'HighlightMap', {
    // BareScript
    'barescript': {
        'builtin': [
            'arrayCopy', 'arrayExtend', 'arrayGet', 'arrayIndexOf', 'arrayJoin', 'arrayLastIndexOf', 'arrayLength',
            'arrayNew', 'arrayNewSize', 'arrayPop', 'arrayPush', 'arraySet', 'arrayShift', 'arraySlice', 'arraySort',
            'dataAggregate', 'dataCalculatedField', 'dataFilter', 'dataJoin', 'dataLineChart', 'dataParseCSV',
            'dataSort', 'dataTable', 'dataTop', 'dataValidate', 'datetimeDay', 'datetimeHour', 'datetimeISOFormat',
            'datetimeISOParse', 'datetimeMillisecond', 'datetimeMinute', 'datetimeMonth', 'datetimeNew', 'datetimeNow',
            'datetimeSecond', 'datetimeToday', 'datetimeYear', 'documentFontSize', 'documentInputValue',
            'documentSetFocus', 'documentSetReset', 'documentSetTitle', 'documentURL', 'drawArc', 'drawCircle',
            'drawClose', 'drawEllipse', 'drawHLine', 'drawHeight', 'drawImage', 'drawLine', 'drawMove', 'drawNew',
            'drawOnClick', 'drawPathRect', 'drawRect', 'drawStyle', 'drawText', 'drawTextHeight', 'drawTextStyle',
            'drawTextWidth', 'drawVLine', 'drawWidth', 'elementModelRender', 'jsonParse', 'jsonStringify',
            'localStorageClear', 'localStorageGet', 'localStorageRemove', 'localStorageSet', 'markdownEscape',
            'markdownHeaderId', 'markdownParse', 'markdownPrint', 'markdownTitle', 'mathAbs', 'mathAcos', 'mathAsin',
            'mathAtan', 'mathAtan2', 'mathCeil', 'mathCos', 'mathFloor', 'mathLn', 'mathLog', 'mathMax', 'mathMin',
            'mathPi', 'mathRandom', 'mathRound', 'mathSign', 'mathSin', 'mathSqrt', 'mathTan', 'numberParseFloat',
            'numberParseInt', 'numberToFixed', 'objectAssign', 'objectCopy', 'objectDelete', 'objectGet', 'objectHas',
            'objectKeys', 'objectNew', 'objectSet', 'regexEscape', 'regexMatch', 'regexMatchAll', 'regexNew',
            'regexReplace', 'regexSplit', 'schemaElements', 'schemaParse', 'schemaParseEx', 'schemaTypeModel',
            'schemaValidate', 'schemaValidateTypeModel', 'sessionStorageClear', 'sessionStorageGet',
            'sessionStorageRemove', 'sessionStorageSet', 'stringCharCodeAt', 'stringEndsWith', 'stringFromCharCode',
            'stringIndexOf', 'stringLastIndexOf', 'stringLength', 'stringLower', 'stringNew', 'stringRepeat',
            'stringReplace', 'stringSlice', 'stringSplit', 'stringStartsWith', 'stringTrim', 'stringUpper',
            'systemBoolean', 'systemCompare', 'systemFetch', 'systemGlobalGet', 'systemGlobalSet', 'systemIs',
            'systemLog', 'systemLogDebug', 'systemPartial', 'systemType', 'urlEncode', 'urlEncodeComponent',
            'urlObjectCreate', 'windowHeight', 'windowSetLocation', 'windowSetResize', 'windowSetTimeout', 'windowWidth'
        ],
        'comment': [rCommentHash],
        'keyword': [
            'async', 'break', 'continue', 'else', 'elif', 'endfor', 'endfunction', 'endif', 'endwhile', 'for',
            'function', 'if', 'in', 'include', 'jump', 'jumpif', 'return', 'while'
        ],
        'literal': [rBoolean, rNumber, rNull],
        'string': [rStringSingle, rStringDouble]
    },

    // JavaScript (ES6)
    'javascript': {
        'builtin': [
            'Array', 'ArrayBuffer', 'Boolean', 'console', 'DataView', 'Date', 'decodeURI', 'decodeURIComponent',
            'encodeURI', 'encodeURIComponent', 'Error', 'EvalError', 'Float32Array', 'Float64Array', 'Function',
            'Infinity', 'Int8Array', 'Int16Array', 'Int32Array', 'isFinite', 'isNaN', 'JSON', 'Map', 'Math', 'NaN',
            'Number', 'Object', 'parseFloat', 'parseInt', 'Promise', 'Proxy', 'RangeError', 'ReferenceError', 'Reflect',
            'RegExp', 'Set', 'String', 'Symbol', 'SyntaxError', 'TypeError', 'Uint8Array', 'Uint8ClampedArray',
            'Uint16Array', 'Uint32Array', 'URIError', 'WeakMap', 'WeakSet'
        ],
        'comment': [rCommentSlashSlash, rCommentSlashStar],
        'keyword': [
            'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else',
            'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new',
            'return', 'super', 'switch', 'static', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with',
            'yield'
        ],
        'literal': [rBoolean, rNumber, rNull, '\\bundefined\\b'],
        'string': [rStringSingle, rStringDouble, '`(?:[^`\\\\]|\\\\[\\s\\S])*`']
    },

    // JSON
    'json': {
        'literal': [rBoolean, rNumber, rNull],
        'string': [rStringDouble]
    },

    // Markdown
    'markdown': {
        'literal': [rCommentHash]
    },

    // Python
    'python': {
        'builtin': [
            '__import__', 'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'breakpoint', 'bytearray', 'bytes', 'callable',
            'chr', 'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir', 'divmod', 'enumerate', 'eval', 'exec',
            'filter', 'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash', 'help', 'hex', 'id',
            'input', 'int', 'isinstance', 'issubclass', 'iter', 'len', 'list', 'locals', 'map', 'max', 'memoryview',
            'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print', 'property', 'range', 'repr', 'reversed',
            'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type',
            'vars', 'zip'
        ],
        'comment': [rCommentHash],
        'keyword': [
            'and', 'as', 'assert', 'async', 'await', 'break', 'case', 'class', 'continue', 'def', 'del', 'elif', 'else',
            'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'match', 'nonlocal',
            'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'
        ],
        'literal': ['\\b(?:False|True)\\b', rNumber, '\\bNone\\b'],
        'string': ["'''[\\s\\S]*?'''", '"""[\\s\\S]*?"""', rStringSingle, rStringDouble]
    },

    // Schema Markdown
    'schema-markdown': {
        'builtin': [
            'bool', 'date', 'datetime', 'float', 'int', 'object', 'string', 'uuid'
        ],
        'comment': [rCommentHash],
        'keyword': [
            'action', 'enum', 'errors', 'group', 'input', 'nullable', 'optional', 'output', 'path', 'query', 'struct',
            'typedef', 'union', 'urls'
        ],
        'string': [rStringDouble]
    },

    // Shell
    'shell': {
        'builtin': [
            'alias', 'bg', 'bind', 'break', 'builtin', 'caller', 'cd', 'command', 'compgen', 'complete', 'compopt',
            'continue', 'declare', 'dirs', 'disown', 'echo', 'enable', 'eval', 'exec', 'exit', 'export', 'false', 'fc',
            'fg', 'getopts', 'hash', 'help', 'history', 'jobs', 'kill', 'let', 'local', 'logout', 'mapfile', 'popd',
            'printf', 'pushd', 'pwd', 'read', 'readarray', 'readonly', 'return', 'set', 'shift', 'shopt', 'source',
            'suspend', 'test', 'times', 'trap', 'true', 'type', 'typeset', 'ulimit', 'umask', 'unalias', 'unset', 'wait'
        ],
        'comment': [rCommentHash],
        'keyword': [
            'case', 'do', 'done', 'elif', 'else', 'esac', 'fi', 'for', 'function', 'if', 'in', 'select', 'then', 'time',
            'until', 'while'
        ],
        'string': [rStringSingle, rStringDouble]
    }
});


// The code block alias to language map
const highlightAliases = {
    // BareScript
    'bare-script': 'barescript',
    'markdown-script': 'barescript',

    // JavaScript
    'js': 'javascript',
    'node': 'javascript',

    // Markdown
    'md': 'markdown',

    // Python
    'python3': 'python',

    // Shell
    'sh': 'shell',
    'bash': 'shell',
    'zsh': 'shell'
};


// The code block language to regex object
const rRegexEscape = /[.*+?^${}()|[\]\\]/g;
const highlightRegex = Object.fromEntries(Object.keys(highlightLanguages).map((language) => {
    const highlight = highlightLanguages[language];
    const regex = {};
    const parts = [];

    // Create word-list regex
    for (const member of ['builtin', 'keyword']) {
        if (member in highlight) {
            const part = highlight[member].map((str) => str.replace(rRegexEscape, '\\$&')).join('|');
            regex[member] = new RegExp(`^\\b(?:${part})\\b`);
            parts.push(`\\b(?:${part})\\b`);
        }
    }

    // Create regex-based regex
    for (const member of ['literal', 'comment', 'string']) {
        if (member in highlight) {
            const part = highlight[member].map((str) => `(?:${str})`).join('|');
            regex[member] = new RegExp(`^(?:${part})`);
            parts.push(part);
        }
    }

    // Aggregate highlight matching regexp
    regex.highlight = new RegExp(parts.map((part) => `(?:${part})`).join('|'), 'm');

    return [language, regex];
}));
