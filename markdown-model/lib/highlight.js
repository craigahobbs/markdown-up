// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-model/blob/main/LICENSE

/** @module lib/highlight */

import {getStructMembers, validateType} from '../../schema-markdown/lib/schema.js';
import {escapeMarkdownText} from './parser.js';
import {parseSchemaMarkdown} from '../../schema-markdown/lib/parser.js';


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
        let color;
        for (const memberName of getStructMembers(highlightTypes, highlightTypes.Highlight.struct).map((member) => member.name)) {
            if (memberName in regex && regex[memberName].test(highlightText)) {
                color = `var(--markdown-model-color-highlight-${memberName})`;
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
    return {'html': 'pre', 'elem': {'html': 'code', 'elem': spans}};
}


// The syntax-highlight model
const highlightTypes = parseSchemaMarkdown(`\
# Code block language to highlight model map
typedef Highlight{} HighlightMap


# Code syntax-highlighting model
struct Highlight

    # Built-in regular expressions
    optional string[] builtin

    # Comment regular expressions
    optional string[] comment

    # Keyword regular expressions
    optional string[] keyword

    # Literal regular expressions
    optional string[] literal

    # Preprocessor regular expressions
    optional string[] preprocessor

    # String regular expressions
    optional string[] string
`);


// Helper to create a word list regular expression
function createWordListRegex(...words) {
    return `\\b(?:${words.map((str) => escapeMarkdownText(str)).join('|')})\\b`;
}


// Common regular expression source
const rBoolean = createWordListRegex('false', 'true');
const rCommentHash = '#[^\\n\\r]*';
const rCommentSlashSlash = '\\/\\/[^\\n\\r]*';
const rCommentSlashStar = '\\/\\*[\\s\\S]*?\\*\\/';
const rNumber = '(?:\\b|[+-]?)\\d+(?:\\.\\d*)?(?:e[+-]\\d+)?\\b';
const rNull = createWordListRegex('null');
const rStringSingle = "'(?:[^'\\\\]|\\\\.)*'";
const rStringDouble = '"(?:[^"\\\\]|\\\\.)*"';


// The code block language to highlight model map
const highlightLanguages = validateType(highlightTypes, 'HighlightMap', {
    // BareScript
    'barescript': {
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
        'literal': [rBoolean, rNumber, rNull],
        'string': [rStringSingle, rStringDouble]
    },

    // C
    'c': {
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
        'literal': [rBoolean, rNumber, createWordListRegex('NULL')],
        'preprocessor': [
            '^[ \\t]*#(?:define|include|ifdef|ifndef|endif|if|else|elif|undef|pragma|error|warning|line)\\b'
        ],
        'string': [rStringSingle, rStringDouble]
    },

    // cpp
    'cpp': {
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
        'literal': [rBoolean, rNumber, createWordListRegex('NULL')],
        'preprocessor': [
            '^[ \\t]*#(?:define|include|ifdef|ifndef|endif|if|else|elif|undef|pragma|error|warning|line)\\b'
        ],
        'string': [
            rStringSingle,
            rStringDouble,
            'R"([^\\s]*)\\((?:[\\s\\S]*?)\\)\\1"' // Raw string literals
        ]
    },

    // C#
    'csharp': {
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
                'descending', 'do', 'double', 'dynamic', 'else', 'enum', 'equals', 'event', 'explicit', 'extern', 'false',
                'finally', 'fixed', 'float', 'for', 'foreach', 'from', 'get', 'global', 'goto', 'group', 'if', 'implicit',
                'in', 'int', 'interface', 'internal', 'into', 'is', 'join', 'let', 'lock', 'long', 'namespace', 'nameof',
                'new', 'null', 'object', 'on', 'operator', 'orderby', 'out', 'override', 'params', 'partial', 'private',
                'protected', 'public', 'readonly', 'ref', 'remove', 'return', 'sbyte', 'sealed', 'select', 'set', 'short',
                'sizeof', 'stackalloc', 'static', 'string', 'struct', 'switch', 'this', 'throw', 'true', 'try', 'typeof',
                'uint', 'ulong', 'unchecked', 'unsafe', 'ushort', 'using', 'value', 'var', 'virtual', 'void', 'volatile',
                'when', 'where', 'while', 'yield'
            )
        ],
        'literal': [rBoolean, rNull, rNumber],
        'preprocessor': [
            '^\\s*#(?:define|elif|else|endif|error|if|line|pragma|region|endregion|undef|warning)\\b'
        ],
        'string': ['@"(?:[^"]|"")*"', rStringSingle, rStringDouble]
    },

    // Java
    'java': {
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
        'literal': [rBoolean, rNull, rNumber],
        'preprocessor': ['@\\w+'],
        'string': ['"""[\\s\\S]*?"""', rStringSingle, rStringDouble]
    },

    // JavaScript (ES6)
    'javascript': {
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
        'literal': [rBoolean, rNumber, rNull, createWordListRegex('undefined')],
        'string': [rStringSingle, rStringDouble, '`(?:[^`\\\\]|\\\\[\\s\\S])*`']
    },

    // JSON
    'json': {
        'literal': [rBoolean, rNumber, rNull],
        'string': [rStringDouble]
    },

    // Makefile
    'makefile': {
        'builtin': [
            createWordListRegex(
                'abspath', 'addprefix', 'addsuffix', 'basename', 'call', 'dir', 'error', 'eval', 'file', 'filter',
                'filter-out', 'findstring', 'firstword', 'foreach', 'if', 'join', 'lastword', 'notdir', 'origin',
                'patsubst', 'realpath', 'shell', 'sort', 'strip', 'subst', 'suffix', 'value', 'warning', 'wildcard',
                'word', 'wordlist', 'words'
            )
        ],
        'comment': [rCommentHash],
        'keyword': [
            createWordListRegex(
                'define', 'else', 'endef', 'endif', 'export', 'ifdef', 'ifeq', 'ifndef', 'ifneq', 'include', 'override',
                'unexport', 'vpath'
            )
        ],
        'preprocessor': [
            '^ *\\.(?:PHONY|phony)'
        ],
        'string': [rStringSingle, rStringDouble]
    },

    // Markdown
    'markdown': {
        'literal': [rCommentHash]
    },

    // Python
    'python': {
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

    // Schema Markdown
    'schema-markdown': {
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
    'shell': {
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
    'sql': {
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
        'comment': ['--[^\\n\\r]*', rCommentSlashStar],
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

    // XML
    'xml': {
        'comment': ['<!--[\\s\\S]*?-->'],
        'literal': ['&#[0-9]+;', '&(?:amp|apos|gt|lt|quot);'],
        'preprocessor': [
            '<\\?.*?\\?>',
            '<!DOCTYPE[^>]*>',
            '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'
        ],
        'string': [rStringSingle, rStringDouble]
    }
});


// The code block alias to language map
const highlightAliases = {
    // BareScript
    'bare-script': 'barescript',
    'markdown-script': 'barescript',

    // C#
    'c#': 'csharp',
    'cake': 'csharp',
    'cakescript': 'csharp',

    // C++
    'c++': 'cpp',

    // JavaScript
    'js': 'javascript',
    'node': 'javascript',

    // Makefile
    'bsdmake': 'makefile',
    'make': 'makefile',
    'mf': 'makefile',

    // Markdown
    'md': 'markdown',

    // Python
    'python3': 'python',

    // Shell
    'sh': 'shell',
    'bash': 'shell',
    'zsh': 'shell',

    // SQL
    'plsql': 'sql',
    'tsql': 'sql',

    // XML
    'rss': 'xml',
    'xsd': 'xml',
    'wsdl': 'xml'
};


// The code block language to regex object
const highlightRegex = Object.fromEntries(Object.keys(highlightLanguages).map((language) => {
    const highlight = highlightLanguages[language];
    const regex = {};
    const parts = [];

    // Create regex-based regex
    for (const memberName of getStructMembers(highlightTypes, highlightTypes.Highlight.struct).map((member) => member.name)) {
        if (memberName in highlight) {
            const part = highlight[memberName].map((str) => `(?:${str})`).join('|');
            regex[memberName] = new RegExp(`^(?:${part})`);
            parts.push(part);
        }
    }

    // Aggregate highlight matching regexp
    regex.highlight = new RegExp(parts.map((part) => `(?:${part})`).join('|'), 'm');

    return [language, regex];
}));
