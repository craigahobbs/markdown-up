// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {JSDOM} from 'jsdom/lib/api.js';
import {MarkdownScriptRuntime} from '../lib/script.js';
import {markdownScriptFunctions} from '../lib/scriptLibrary.js';
import {parseSchemaMarkdown} from 'schema-markdown/lib/parser.js';
import test from 'ava';


/* eslint-disable id-length */


// Generic test runtime options
const testRuntime = () => {
    const {window} = new JSDOM('', {'url': 'https://github.com/craigahobbs/markdown-up'});
    const options = {
        'fontSize': 12,
        'urlFn': (url) => (url.startsWith('/') ? url : `/foo/${url}`),
        window
    };
    options.runtime = new MarkdownScriptRuntime(options);
    return options.runtime;
};


//
// Data functions
//


test('script library, dataAggregate', (t) => {
    const runtime = testRuntime();
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    const aggregation = {
        'categories': ['a'],
        'measures': [
            {'field': 'b', 'function': 'sum', 'name': 'sum_b'}
        ]
    };
    t.deepEqual(markdownScriptFunctions.dataAggregate([data, aggregation], runtime.options), [
        {'a': 1, 'sum_b': 7},
        {'a': 2, 'sum_b': 5}
    ]);
});


test('script library, dataCalculatedField', (t) => {
    const runtime = testRuntime();
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    t.deepEqual(markdownScriptFunctions.dataCalculatedField([data, 'c', 'a * b'], runtime.options), [
        {'a': 1, 'b': 3, 'c': 3},
        {'a': 1, 'b': 4, 'c': 4},
        {'a': 2, 'b': 5, 'c': 10}
    ]);
});


test('script library, dataCalculatedField variables', (t) => {
    const runtime = testRuntime();
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    const variables = {'d': 2};
    t.deepEqual(markdownScriptFunctions.dataCalculatedField([data, 'c', 'b * d', variables], runtime.options), [
        {'a': 1, 'b': 3, 'c': 6},
        {'a': 1, 'b': 4, 'c': 8},
        {'a': 2, 'b': 5, 'c': 10}
    ]);
});


test('script library, dataCalculatedField globals', (t) => {
    const runtime = testRuntime();
    runtime.options.globals = {'e': 3};
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    t.deepEqual(markdownScriptFunctions.dataCalculatedField([data, 'c', 'b * e'], runtime.options), [
        {'a': 1, 'b': 3, 'c': 9},
        {'a': 1, 'b': 4, 'c': 12},
        {'a': 2, 'b': 5, 'c': 15}
    ]);
});


test('script library, dataCalculatedField globals variables', (t) => {
    const runtime = testRuntime();
    runtime.options.globals = {'e': 3};
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    const variables = {'d': 2};
    t.deepEqual(markdownScriptFunctions.dataCalculatedField([data, 'c', 'b * d * e', variables], runtime.options), [
        {'a': 1, 'b': 3, 'c': 18},
        {'a': 1, 'b': 4, 'c': 24},
        {'a': 2, 'b': 5, 'c': 30}
    ]);
});


test('script library, dataFilter', (t) => {
    const runtime = testRuntime();
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    t.deepEqual(markdownScriptFunctions.dataFilter([data, 'b > 3'], runtime.options), [
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ]);
});


test('script library, dataFilter variables', (t) => {
    const runtime = testRuntime();
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ];
    const variables = {'d': 3};
    t.deepEqual(markdownScriptFunctions.dataFilter([data, 'b > d', variables], runtime.options), [
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ]);
});


test('script library, dataJoin', (t) => {
    const runtime = testRuntime();
    const leftData = [
        {'a': 1, 'b': 5},
        {'a': 1, 'b': 6},
        {'a': 2, 'b': 7},
        {'a': 3, 'b': 8}
    ];
    const rightData = [
        {'a': 1, 'c': 10},
        {'a': 2, 'c': 11},
        {'a': 2, 'c': 12}
    ];
    t.deepEqual(markdownScriptFunctions.dataJoin([leftData, rightData, 'a'], runtime.options), [
        {'a': 1, 'b': 5, 'a2': 1, 'c': 10},
        {'a': 1, 'b': 6, 'a2': 1, 'c': 10},
        {'a': 2, 'b': 7, 'a2': 2, 'c': 11},
        {'a': 2, 'b': 7, 'a2': 2, 'c': 12},
        {'a': 3, 'b': 8}
    ]);
});


test('script library, dataJoin options', (t) => {
    const runtime = testRuntime();
    const leftData = [
        {'a': 1, 'b': 5},
        {'a': 1, 'b': 6},
        {'a': 2, 'b': 7},
        {'a': 3, 'b': 8}
    ];
    const rightData = [
        {'a': 2, 'c': 10},
        {'a': 4, 'c': 11},
        {'a': 4, 'c': 12}
    ];
    t.deepEqual(
        markdownScriptFunctions.dataJoin([leftData, rightData, 'a', 'a / denominator', true, {'denominator': 2}], runtime.options),
        [
            {'a': 1, 'b': 5, 'a2': 2, 'c': 10},
            {'a': 1, 'b': 6, 'a2': 2, 'c': 10},
            {'a': 2, 'b': 7, 'a2': 4, 'c': 11},
            {'a': 2, 'b': 7, 'a2': 4, 'c': 12}
        ]
    );
});


test('script library, dataLineChart', (t) => {
    const runtime = testRuntime();
    const data = [
        {'a': 1, 'b': 3},
        {'a': 2, 'b': 1}
    ];
    const lineChart = {'x': 'a', 'y': ['b']};
    t.deepEqual(markdownScriptFunctions.dataLineChart([data, lineChart], runtime.options), undefined);
    t.is(runtime.drawingWidth, 640);
    t.is(runtime.drawingHeight, 320);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 640, 'height': 320},
                'elem': [
                    {
                        'svg': 'rect',
                        'attr': {'width': 640, 'height': 320, 'fill': 'white'}
                    },
                    null,
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'style': 'font-weight: bold',
                            'x': '16.000',
                            'y': '136.725',
                            'transform': 'rotate(-90 16.000, 136.725)',
                            'text-anchor': 'middle',
                            'dominant-baseline': 'hanging'
                        },
                        'elem': {'text': 'b'}
                    },
                    [
                        [
                            {
                                'svg': 'path',
                                'attr': {'stroke': 'black', 'stroke-width': '1.000', 'fill': 'none', 'd': 'M 63.150 255.950 H 58.150'}
                            },
                            null
                        ],
                        [
                            {
                                'svg': 'path',
                                'attr': {'stroke': 'black', 'stroke-width': '1.000', 'fill': 'none', 'd': 'M 63.150 136.725 H 58.150'}
                            },
                            {
                                'svg': 'path',
                                'attr': {'stroke': 'lightgray', 'stroke-width': '1.000', 'fill': 'none', 'd': 'M 63.150 136.725 H 624.000'}
                            }
                        ],
                        [
                            {
                                'svg': 'path',
                                'attr': {'stroke': 'black', 'stroke-width': '1.000', 'fill': 'none', 'd': 'M 63.150 17.500 H 58.150'}
                            },
                            null
                        ]
                    ],
                    [
                        {
                            'svg': 'text',
                            'attr': {
                                'font-family': 'Arial, Helvetica, sans-serif',
                                'font-size': '16.000px',
                                'fill': 'black',
                                'x': '54.400',
                                'y': '255.950',
                                'text-anchor': 'end',
                                'dominant-baseline': 'auto'
                            },
                            'elem': {'text': '1'}
                        },
                        {
                            'svg': 'text',
                            'attr': {
                                'font-family': 'Arial, Helvetica, sans-serif',
                                'font-size': '16.000px',
                                'fill': 'black',
                                'x': '54.400',
                                'y': '136.725',
                                'text-anchor': 'end',
                                'dominant-baseline': 'middle'
                            },
                            'elem': {'text': '2'}
                        },
                        {
                            'svg': 'text',
                            'attr': {
                                'font-family': 'Arial, Helvetica, sans-serif',
                                'font-size': '16.000px',
                                'fill': 'black',
                                'x': '54.400',
                                'y': '17.500',
                                'text-anchor': 'end',
                                'dominant-baseline': 'hanging'
                            },
                            'elem': {'text': '3'}
                        }
                    ],
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'style': 'font-weight: bold',
                            'x': '344.575',
                            'y': '304.000',
                            'text-anchor': 'middle',
                            'dominant-baseline': 'auto'
                        },
                        'elem': {'text': 'a'}
                    },
                    [
                        [
                            {
                                'svg': 'path',
                                'attr': {'stroke': 'black', 'stroke-width': '1.000', 'fill': 'none', 'd': 'M 65.150 257.950 V 262.950'}
                            },
                            null
                        ],
                        [
                            {
                                'svg': 'path',
                                'attr': {'stroke': 'black', 'stroke-width': '1.000', 'fill': 'none', 'd': 'M 344.575 257.950 V 262.950'}
                            },
                            {
                                'svg': 'path',
                                'attr': {'stroke': 'lightgray', 'stroke-width': '1.000', 'fill': 'none', 'd': 'M 344.575 257.950 V 17.500'}
                            }
                        ],
                        [
                            {
                                'svg': 'path',
                                'attr': {'stroke': 'black', 'stroke-width': '1.000', 'fill': 'none', 'd': 'M 624.000 257.950 V 262.950'}
                            },
                            null
                        ]
                    ],
                    [
                        {
                            'svg': 'text',
                            'attr': {
                                'font-family': 'Arial, Helvetica, sans-serif',
                                'font-size': '16.000px',
                                'fill': 'black',
                                'x': '65.150',
                                'y': '266.700',
                                'text-anchor': 'start',
                                'dominant-baseline': 'hanging'
                            },
                            'elem': {'text': '1'}
                        },
                        {
                            'svg': 'text',
                            'attr': {
                                'font-family': 'Arial, Helvetica, sans-serif',
                                'font-size': '16.000px',
                                'fill': 'black',
                                'x': '344.575',
                                'y': '266.700',
                                'text-anchor': 'middle',
                                'dominant-baseline': 'hanging'
                            },
                            'elem': {'text': '1.50'}
                        },
                        {
                            'svg': 'text',
                            'attr': {
                                'font-family': 'Arial, Helvetica, sans-serif',
                                'font-size': '16.000px',
                                'fill': 'black',
                                'x': '624.000',
                                'y': '266.700',
                                'text-anchor': 'end',
                                'dominant-baseline': 'hanging'
                            },
                            'elem': {'text': '2'}
                        }
                    ],
                    {
                        'svg': 'path',
                        'attr': {'stroke': 'black', 'stroke-width': '1.000', 'fill': 'none', 'd': 'M 63.150 17.000 V 257.950 H 624.500'}
                    },
                    [
                        {
                            'svg': 'path',
                            'attr': {'stroke': '#1f77b4', 'stroke-width': '3.000', 'fill': 'none', 'd': 'M 65.150 17.500 L 624.000 255.950'}
                        }
                    ],
                    [],
                    [],
                    null
                ]
            }
        }
    ]);
});


test('script library, dataParseCSV', (t) => {
    const runtime = testRuntime();
    const text = `\
a,b
1,3
`;
    const text2 = `\
1,4
2,5
`;
    t.deepEqual(markdownScriptFunctions.dataParseCSV([text, text2], runtime.options), [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ]);
});


test('script library, dataSort', (t) => {
    const runtime = testRuntime();
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5},
        {'a': 3, 'b': 6},
        {'a': 4, 'b': 7}
    ];
    t.deepEqual(markdownScriptFunctions.dataSort([data, [['a', true], ['b']]], runtime.options), [
        {'a': 4, 'b': 7},
        {'a': 3, 'b': 6},
        {'a': 2, 'b': 5},
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4}
    ]);
});


test('script library, dataTable', (t) => {
    const runtime = testRuntime();
    const data = [
        {'a': 1, 'b': 3},
        {'a': 2, 'b': 1}
    ];
    t.deepEqual(markdownScriptFunctions.dataTable([data], runtime.options), undefined);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'table',
            'elem': [
                {
                    'html': 'tr',
                    'elem': [[], [{'html': 'th', 'elem': {'text': 'a'}}, {'html': 'th', 'elem': {'text': 'b'}}]]
                },
                [
                    {
                        'html': 'tr',
                        'elem': [[], [{'html': 'td', 'elem': {'text': '1'}}, {'html': 'td', 'elem': {'text': '3'}}]]
                    },
                    {
                        'html': 'tr',
                        'elem': [[], [{'html': 'td', 'elem': {'text': '2'}}, {'html': 'td', 'elem': {'text': '1'}}]]
                    }
                ]
            ]
        }
    ]);
});


test('script library, dataTable model', (t) => {
    const runtime = testRuntime();
    const data = [
        {'a': 1, 'b': 3},
        {'a': 2, 'b': 1}
    ];
    const dataTable = {'fields': ['a']};
    t.deepEqual(markdownScriptFunctions.dataTable([data, dataTable], runtime.options), undefined);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'table',
            'elem': [
                {
                    'html': 'tr',
                    'elem': [[], [{'html': 'th', 'elem': {'text': 'a'}}]]
                },
                [
                    {
                        'html': 'tr',
                        'elem': [[], [{'html': 'td', 'elem': {'text': '1'}}]]
                    },
                    {
                        'html': 'tr',
                        'elem': [[], [{'html': 'td', 'elem': {'text': '2'}}]]
                    }
                ]
            ]
        }
    ]);
});


test('script library, dataTop', (t) => {
    const runtime = testRuntime();
    const data = [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5},
        {'a': 3, 'b': 6},
        {'a': 4, 'b': 7}
    ];
    t.deepEqual(markdownScriptFunctions.dataTop([data, 3], runtime.options), [
        {'a': 1, 'b': 3},
        {'a': 1, 'b': 4},
        {'a': 2, 'b': 5}
    ]);
    t.deepEqual(markdownScriptFunctions.dataTop([data, 1, ['a']], runtime.options), [
        {'a': 1, 'b': 3},
        {'a': 2, 'b': 5},
        {'a': 3, 'b': 6},
        {'a': 4, 'b': 7}
    ]);
});


test('script library, dataValidate', (t) => {
    const runtime = testRuntime();
    const data = [
        {'a': '1', 'b': 3},
        {'a': '1', 'b': 4},
        {'a': '2', 'b': 5}
    ];
    t.deepEqual(markdownScriptFunctions.dataValidate([data], runtime.options), [
        {'a': '1', 'b': 3},
        {'a': '1', 'b': 4},
        {'a': '2', 'b': 5}
    ]);
});


//
// Document functions
//


test('script library, documentURL', (t) => {
    const runtime = testRuntime();
    t.is(markdownScriptFunctions.documentURL(['/foo/bar/'], runtime.options), '/foo/bar/');
    t.is(markdownScriptFunctions.documentURL(['bar/'], runtime.options), '/foo/bar/');
});


test('script library, getDocumentFontSize', (t) => {
    const runtime = testRuntime();
    t.is(markdownScriptFunctions.getDocumentFontSize([], runtime.options), 16);
});


test('script library, getDocumentInputValue', (t) => {
    const runtime = testRuntime();
    t.is(markdownScriptFunctions.getDocumentInputValue(['test-input'], runtime.options), null);
    runtime.options.window.document.body.innerHTML = '<div id="test-input"/>';
    t.is(markdownScriptFunctions.getDocumentInputValue(['test-input'], runtime.options), null);
    runtime.options.window.document.body.innerHTML = '<input id="test-input" type="text" value="The text"/>';
    t.is(markdownScriptFunctions.getDocumentInputValue(['test-input'], runtime.options), 'The text');
});


test('script library, getWindowHeight', (t) => {
    const runtime = testRuntime();
    t.is(markdownScriptFunctions.getWindowHeight([], runtime.options), 768);
});


test('script library, getWindowWidth', (t) => {
    const runtime = testRuntime();
    t.is(markdownScriptFunctions.getWindowWidth([], runtime.options), 1024);
});


test('script library, setDocumentFocus', (t) => {
    const runtime = testRuntime();
    t.is(runtime.documentFocus, null);
    markdownScriptFunctions.setDocumentFocus(['test-input'], runtime.options);
    t.is(runtime.documentFocus, 'test-input');
});


test('script library, setDocumentReset', (t) => {
    const runtime = testRuntime();
    t.is(runtime.documentReset, null);
    t.is(markdownScriptFunctions.setDocumentReset(['resetID'], runtime.options), undefined);
    t.is(runtime.documentReset, 'resetID');
});


test('script library, setDocumentTitle', (t) => {
    const runtime = testRuntime();
    t.is(runtime.documentTitle, null);
    markdownScriptFunctions.setDocumentTitle(['The Title'], runtime.options);
    t.is(runtime.documentTitle, 'The Title');
});


test('script library, setWindowLocation', (t) => {
    const runtime = testRuntime();
    t.is(runtime.windowLocation, null);
    markdownScriptFunctions.setWindowLocation(['/other'], runtime.options);
    t.is(runtime.windowLocation, '/other');
    markdownScriptFunctions.setWindowLocation(['other'], runtime.options);
    t.is(runtime.windowLocation, '/foo/other');
});


test('script library, setWindowResize', async (t) => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    t.is(runtime.windowResize, null);
    t.is(runtime.options.statementCount, undefined);

    let onsizeCount = 0;
    const onsize = () => ++onsizeCount;
    markdownScriptFunctions.setWindowResize([onsize], runtime.options);

    t.is(typeof runtime.windowResize, 'function');
    t.is(runtime.windowResize.constructor.name, 'AsyncFunction');
    t.is(runtime.options.statementCount, undefined);
    t.is(runtimeUpdateCount, 0);
    t.is(onsizeCount, 0);

    await runtime.windowResize();
    t.is(runtime.options.statementCount, 0);
    t.is(runtimeUpdateCount, 1);
    t.is(onsizeCount, 1);
});


test('script library, setWindowResize async', async (t) => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    t.is(runtime.windowResize, null);
    t.is(runtime.options.statementCount, undefined);

    let onsizeCount = 0;
    // eslint-disable-next-line require-await
    const onsize = async () => ++onsizeCount;
    markdownScriptFunctions.setWindowResize([onsize], runtime.options);

    t.is(typeof runtime.windowResize, 'function');
    t.is(runtime.windowResize.constructor.name, 'AsyncFunction');
    t.is(runtime.options.statementCount, undefined);
    t.is(runtimeUpdateCount, 0);
    t.is(onsizeCount, 0);

    await runtime.windowResize();
    t.is(runtime.options.statementCount, 0);
    t.is(runtimeUpdateCount, 1);
    t.is(onsizeCount, 1);
});


test('script library, setWindowResize callback error', async (t) => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;
    const logs = [];
    runtime.options.logFn = (message) => logs.push(message);

    t.is(runtime.windowResize, null);
    t.is(runtime.options.statementCount, undefined);

    let onsizeCount = 0;
    const onsize = () => {
        ++onsizeCount;
        throw new Error('BOOM!');
    };
    markdownScriptFunctions.setWindowResize([onsize], runtime.options);

    t.is(typeof runtime.windowResize, 'function');
    t.is(runtime.windowResize.constructor.name, 'AsyncFunction');
    t.is(runtime.options.statementCount, undefined);
    t.is(runtimeUpdateCount, 0);
    t.deepEqual(logs, []);
    t.is(onsizeCount, 0);

    await runtime.windowResize();
    t.is(runtime.options.statementCount, 0);
    t.is(runtimeUpdateCount, 1);
    t.deepEqual(logs, ['MarkdownUp: Error executing setWindowResize callback: BOOM!']);
    t.is(onsizeCount, 1);
});


test('script library, setWindowTimeout', async (t) => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    t.is(runtime.windowTimeout, null);
    t.is(runtime.options.statementCount, undefined);

    let ontimeCount = 0;
    const ontime = () => ++ontimeCount;
    markdownScriptFunctions.setWindowTimeout([ontime, 1000], runtime.options);

    t.is(typeof runtime.windowTimeout[0], 'function');
    t.is(runtime.windowTimeout[0].constructor.name, 'AsyncFunction');
    t.is(runtime.windowTimeout[1], 1000);
    t.is(runtime.options.statementCount, undefined);
    t.is(runtimeUpdateCount, 0);
    t.is(ontimeCount, 0);

    await runtime.windowTimeout[0]();
    t.is(runtime.options.statementCount, 0);
    t.is(runtimeUpdateCount, 1);
    t.is(ontimeCount, 1);
});


test('script library, setWindowTimeout async', async (t) => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    t.is(runtime.windowTimeout, null);
    t.is(runtime.options.statementCount, undefined);

    let ontimeCount = 0;
    // eslint-disable-next-line require-await
    const ontime = async () => ++ontimeCount;
    markdownScriptFunctions.setWindowTimeout([ontime, 1000], runtime.options);

    t.is(typeof runtime.windowTimeout[0], 'function');
    t.is(runtime.windowTimeout[0].constructor.name, 'AsyncFunction');
    t.is(runtime.windowTimeout[1], 1000);
    t.is(runtime.options.statementCount, undefined);
    t.is(runtimeUpdateCount, 0);
    t.is(ontimeCount, 0);

    await runtime.windowTimeout[0]();
    t.is(runtime.options.statementCount, 0);
    t.is(runtimeUpdateCount, 1);
    t.is(ontimeCount, 1);
});


test('script library, setWindowTimeout callback error', async (t) => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;
    const logs = [];
    runtime.options.logFn = (message) => logs.push(message);

    t.is(runtime.windowTimeout, null);
    t.is(runtime.options.statementCount, undefined);

    let ontimeCount = 0;
    const ontime = () => {
        ++ontimeCount;
        throw new Error('BOOM!');
    };
    markdownScriptFunctions.setWindowTimeout([ontime, 1000], runtime.options);

    t.is(typeof runtime.windowTimeout[0], 'function');
    t.is(runtime.windowTimeout[0].constructor.name, 'AsyncFunction');
    t.is(runtime.windowTimeout[1], 1000);
    t.is(runtime.options.statementCount, undefined);
    t.is(runtimeUpdateCount, 0);
    t.deepEqual(logs, []);
    t.is(ontimeCount, 0);

    await runtime.windowTimeout[0]();
    t.is(runtime.options.statementCount, 0);
    t.is(runtimeUpdateCount, 1);
    t.deepEqual(logs, ['MarkdownUp: Error executing setWindowTimeout callback: BOOM!']);
    t.is(ontimeCount, 1);
});


//
// Drawing functions
//


test('script library, drawArc', (t) => {
    const runtime = testRuntime();
    markdownScriptFunctions.setDrawingSize([100, 50], runtime.options);
    markdownScriptFunctions.drawMove([0, 25], runtime.options);
    markdownScriptFunctions.drawArc([25, 25, 0, 0, 0, 50, 25], runtime.options);
    markdownScriptFunctions.drawArc([25, 25, 0, 1, 1, 100, 25], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 100, 'height': 50},
                'elem': [
                    {
                        'svg': 'path',
                        'attr': {
                            // eslint-disable-next-line max-len
                            'd': 'M 0.00000000 25.00000000 A 25.00000000 25.00000000 0.00000000 0 0 50.00000000 25.00000000 A 25.00000000 25.00000000 0.00000000 1 1 100.00000000 25.00000000',
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': 1
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawCircle', (t) => {
    const runtime = testRuntime();
    markdownScriptFunctions.setDrawingSize([50, 50], runtime.options);
    markdownScriptFunctions.drawCircle([25, 25, 25], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'circle',
                        'attr': {
                            'cx': 25,
                            'cy': 25,
                            'r': 25,
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': '1.00000000'
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawClose', (t) => {
    const runtime = testRuntime();
    markdownScriptFunctions.setDrawingSize([50, 50], runtime.options);
    markdownScriptFunctions.drawMove([0, 0], runtime.options);
    markdownScriptFunctions.drawLine([50, 0], runtime.options);
    markdownScriptFunctions.drawLine([50, 50], runtime.options);
    markdownScriptFunctions.drawClose([], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 0.00000000 0.00000000 L 50.00000000 0.00000000 L 50.00000000 50.00000000 Z',
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': 1
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawEllipse', (t) => {
    const runtime = testRuntime();
    markdownScriptFunctions.setDrawingSize([50, 40], runtime.options);
    markdownScriptFunctions.drawEllipse([25, 20, 25, 20], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 40},
                'elem': [
                    {
                        'svg': 'ellipse',
                        'attr': {
                            'cx': 25,
                            'cy': 20,
                            'rx': 25,
                            'ry': 20,
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': '1.00000000'
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawHLine', (t) => {
    const runtime = testRuntime();
    markdownScriptFunctions.setDrawingSize([50, 50], runtime.options);
    markdownScriptFunctions.drawMove([0, 25], runtime.options);
    markdownScriptFunctions.drawHLine([50], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 0.00000000 25.00000000 H 50.00000000',
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': 1
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawImage', (t) => {
    const runtime = testRuntime();
    markdownScriptFunctions.setDrawingSize([50, 50], runtime.options);
    markdownScriptFunctions.drawImage([15, 15, 25, 25, '/foo/bar.jpg'], runtime.options);
    markdownScriptFunctions.drawImage([35, 35, 25, 25, 'bar.jpg'], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'image',
                        'attr': {
                            'height': 25,
                            'href': '/foo/bar.jpg',
                            'width': 25,
                            'x': 15,
                            'y': 15
                        }
                    },
                    {
                        'svg': 'image',
                        'attr': {
                            'height': 25,
                            'href': '/foo/bar.jpg',
                            'width': 25,
                            'x': 35,
                            'y': 35
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawLine', (t) => {
    const runtime = testRuntime();
    markdownScriptFunctions.setDrawingSize([50, 50], runtime.options);
    markdownScriptFunctions.drawMove([0, 0], runtime.options);
    markdownScriptFunctions.drawLine([50, 0], runtime.options);
    markdownScriptFunctions.drawLine([50, 50], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 0.00000000 0.00000000 L 50.00000000 0.00000000 L 50.00000000 50.00000000',
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': 1
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawMove', (t) => {
    const runtime = testRuntime();
    markdownScriptFunctions.setDrawingSize([50, 50], runtime.options);
    markdownScriptFunctions.drawMove([0, 0], runtime.options);
    markdownScriptFunctions.drawLine([50, 0], runtime.options);
    markdownScriptFunctions.drawMove([0, 50], runtime.options);
    markdownScriptFunctions.drawLine([50, 50], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 0.00000000 0.00000000 L 50.00000000 0.00000000 M 0.00000000 50.00000000 L 50.00000000 50.00000000',
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': 1
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawOnClick', async (t) => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    // Test click handler function
    let clickCount = 0;
    const clickHandler = ([x, y], options) => {
        t.is(x, 5);
        t.is(y, 10);
        t.not(options, null);
        clickCount += 1;
    };

    // Mock element
    const elementEvents = {};
    const element = {
        'addEventListener': (eventType, eventCallback) => {
            elementEvents[eventType] = eventCallback;
        }
    };

    // Mock event
    const event = {
        'target': {
            'ownerSVGElement': {
                'getBoundingClientRect': () => ({'left': 0, 'top': 0})
            }
        },
        'clientX': 5,
        'clientY': 10
    };

    // Draw a rect and set an on-click event
    markdownScriptFunctions.setDrawingSize([50, 50], runtime.options);
    markdownScriptFunctions.drawRect([0, 0, 50, 50], runtime.options);
    markdownScriptFunctions.drawOnClick([clickHandler], runtime.options);

    // Get the runtime elements
    const elements = runtime.resetElements();
    t.is(typeof elements[0].elem.elem[0].callback, 'function');
    elements[0].elem.elem[0].callback(element);
    t.is(typeof elementEvents.click, 'function');
    t.is(elementEvents.click.constructor.name, 'AsyncFunction');

    // Click the rect
    await elementEvents.click(event);
    t.is(clickCount, 1);
    t.is(runtimeUpdateCount, 1);
});


test('script library, drawOnClick async', async (t) => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    // Test click handler function
    let clickCount = 0;
    // eslint-disable-next-line require-await
    const clickHandler = async ([x, y], options) => {
        t.is(x, 5);
        t.is(y, 10);
        t.not(options, null);
        clickCount += 1;
    };

    // Mock element
    const elementEvents = {};
    const element = {
        'addEventListener': (eventType, eventCallback) => {
            elementEvents[eventType] = eventCallback;
        }
    };

    // Mock event
    const event = {
        'target': {
            'ownerSVGElement': {
                'getBoundingClientRect': () => ({'left': 0, 'top': 0})
            }
        },
        'clientX': 5,
        'clientY': 10
    };

    // Draw a rect and set an on-click event
    markdownScriptFunctions.setDrawingSize([50, 50], runtime.options);
    markdownScriptFunctions.drawRect([0, 0, 50, 50], runtime.options);
    markdownScriptFunctions.drawOnClick([clickHandler], runtime.options);

    // Get the runtime elements
    const elements = runtime.resetElements();
    t.is(typeof elements[0].elem.elem[0].callback, 'function');
    elements[0].elem.elem[0].callback(element);
    t.is(typeof elementEvents.click, 'function');
    t.is(elementEvents.click.constructor.name, 'AsyncFunction');

    // Click the rect
    await elementEvents.click(event);
    t.is(clickCount, 1);
    t.is(runtimeUpdateCount, 1);
});


test('script library, drawOnClick callback error', async (t) => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;
    const logs = [];
    runtime.options.logFn = (message) => logs.push(message);

    // Test click handler function
    let clickCount = 0;
    const clickHandler = ([x, y], options) => {
        t.is(x, 5);
        t.is(y, 10);
        t.not(options, null);
        clickCount += 1;
        throw new Error('BOOM!');
    };

    // Mock element
    const elementEvents = {};
    const element = {
        'addEventListener': (eventType, eventCallback) => {
            elementEvents[eventType] = eventCallback;
        }
    };

    // Mock event
    const event = {
        'target': {
            'ownerSVGElement': {
                'getBoundingClientRect': () => ({'left': 0, 'top': 0})
            }
        },
        'clientX': 5,
        'clientY': 10
    };

    // Draw a rect and set an on-click event
    markdownScriptFunctions.setDrawingSize([50, 50], runtime.options);
    markdownScriptFunctions.drawRect([0, 0, 50, 50], runtime.options);
    markdownScriptFunctions.drawOnClick([clickHandler], runtime.options);

    // Get the runtime elements
    const elements = runtime.resetElements();
    t.is(typeof elements[0].elem.elem[0].callback, 'function');
    elements[0].elem.elem[0].callback(element);
    t.is(typeof elementEvents.click, 'function');
    t.is(elementEvents.click.constructor.name, 'AsyncFunction');

    // Click the rect
    t.is(clickCount, 0);
    t.deepEqual(logs, []);
    await elementEvents.click(event);
    t.is(clickCount, 1);
    t.deepEqual(logs, ['MarkdownUp: Error executing drawOnClick callback: BOOM!']);
    t.is(runtimeUpdateCount, 1);
});


test('script library, drawOnClick drawing click', (t) => {
    const runtime = testRuntime();
    markdownScriptFunctions.setDrawingSize([50, 50], runtime.options);
    markdownScriptFunctions.drawOnClick([null], runtime.options);
    const elements = runtime.resetElements();
    t.is(typeof elements[0].elem.callback, 'function');
    delete elements[0].elem.callback;
    t.deepEqual(elements, [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50, 'style': 'cursor: pointer;'},
                'elem': []
            }
        }
    ]);
});


test('script library, drawRect', (t) => {
    const runtime = testRuntime();
    markdownScriptFunctions.setDrawingSize([50, 50], runtime.options);
    markdownScriptFunctions.drawRect([0, 0, 50, 50, 5, 5], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': 0,
                            'y': 0,
                            'width': 50,
                            'height': 50,
                            'rx': 5,
                            'ry': 5,
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': '1.00000000'
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawStyle', (t) => {
    const runtime = testRuntime();

    markdownScriptFunctions.setDrawingSize([50, 50], runtime.options);
    markdownScriptFunctions.drawMove([0, 0], runtime.options);
    markdownScriptFunctions.drawLine([50, 0], runtime.options);
    markdownScriptFunctions.drawStyle(['red'], runtime.options);
    markdownScriptFunctions.drawMove([50, 0], runtime.options);
    markdownScriptFunctions.drawLine([50, 50], runtime.options);
    markdownScriptFunctions.drawStyle(['red', 2], runtime.options);
    markdownScriptFunctions.drawMove([50, 50], runtime.options);
    markdownScriptFunctions.drawLine([0, 50], runtime.options);
    markdownScriptFunctions.drawStyle(['red', 2, 'blue'], runtime.options);
    markdownScriptFunctions.drawMove([0, 50], runtime.options);
    markdownScriptFunctions.drawLine([0, 0], runtime.options);
    markdownScriptFunctions.drawStyle(['red', 2, 'blue', '4 1'], runtime.options);
    markdownScriptFunctions.drawMove([0, 0], runtime.options);
    markdownScriptFunctions.drawLine([50, 50], runtime.options);

    t.is(runtime.drawingPathStroke, 'red');
    t.is(runtime.drawingPathStrokeWidth, 2);
    t.is(runtime.drawingPathFill, 'blue');
    t.is(runtime.drawingPathStrokeDashArray, '4 1');

    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 0.00000000 0.00000000 L 50.00000000 0.00000000',
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': 1
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 50.00000000 0.00000000 L 50.00000000 50.00000000',
                            'fill': 'none',
                            'stroke': 'red',
                            'stroke-dasharray': 'none',
                            'stroke-width': 1
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 50.00000000 50.00000000 L 0.00000000 50.00000000',
                            'fill': 'none',
                            'stroke': 'red',
                            'stroke-dasharray': 'none',
                            'stroke-width': 2
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 0.00000000 50.00000000 L 0.00000000 0.00000000',
                            'fill': 'blue',
                            'stroke': 'red',
                            'stroke-dasharray': 'none',
                            'stroke-width': 2
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 0.00000000 0.00000000 L 50.00000000 50.00000000',
                            'fill': 'blue',
                            'stroke': 'red',
                            'stroke-dasharray': '4 1',
                            'stroke-width': 2
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawStyle no drawing', (t) => {
    const runtime = testRuntime();

    t.is(runtime.drawingPathStroke, 'black');
    t.is(runtime.drawingPathStrokeWidth, 1);
    t.is(runtime.drawingPathFill, 'none');
    t.is(runtime.drawingPathStrokeDashArray, 'none');

    markdownScriptFunctions.drawStyle(['red', 2, 'blue', '4 1'], runtime.options);

    t.is(runtime.drawingPathStroke, 'red');
    t.is(runtime.drawingPathStrokeWidth, 2);
    t.is(runtime.drawingPathFill, 'blue');
    t.is(runtime.drawingPathStrokeDashArray, '4 1');

    markdownScriptFunctions.drawStyle([], runtime.options);

    t.is(runtime.drawingPathStroke, 'black');
    t.is(runtime.drawingPathStrokeWidth, 1);
    t.is(runtime.drawingPathFill, 'none');
    t.is(runtime.drawingPathStrokeDashArray, 'none');

    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 300, 'height': 200},
                'elem': []
            }
        }
    ]);
});


test('script library, drawText', (t) => {
    const runtime = testRuntime();
    markdownScriptFunctions.setDrawingSize([50, 50], runtime.options);
    markdownScriptFunctions.drawText(['Hello', 25, 15], runtime.options);
    markdownScriptFunctions.drawTextStyle([null, 'black', true, true], runtime.options);
    markdownScriptFunctions.drawText(['World!', 25, 35], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'text',
                        'attr': {
                            'x': 25,
                            'y': 15,
                            'dominant-baseline': 'middle',
                            'fill': 'black',
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.00000000',
                            'font-style': 'normal',
                            'font-weight': 'normal',
                            'text-anchor': 'middle'
                        },
                        'elem': {'text': 'Hello'}
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'x': 25,
                            'y': 35,
                            'dominant-baseline': 'middle',
                            'fill': 'black',
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.00000000',
                            'font-style': 'italic',
                            'font-weight': 'bold',
                            'text-anchor': 'middle'
                        },
                        'elem': {'text': 'World!'}
                    }
                ]
            }
        }
    ]);
});


test('script library, drawTextStyle', (t) => {
    const runtime = testRuntime();

    t.is(runtime.drawingFontSizePx, 16);
    t.is(runtime.drawingFontFill, 'black');
    t.is(runtime.drawingFontBold, false);
    t.is(runtime.drawingFontItalic, false);
    t.is(runtime.drawingFontFamily, 'Arial, Helvetica, sans-serif');

    markdownScriptFunctions.drawTextStyle([10, 'red', true, true, 'Comic Sans'], runtime.options);

    t.is(runtime.drawingFontSizePx, 10);
    t.is(runtime.drawingFontFill, 'red');
    t.is(runtime.drawingFontBold, true);
    t.is(runtime.drawingFontItalic, true);
    t.is(runtime.drawingFontFamily, 'Comic Sans');

    markdownScriptFunctions.drawTextStyle([], runtime.options);

    t.is(runtime.drawingFontSizePx, 16);
    t.is(runtime.drawingFontFill, 'black');
    t.is(runtime.drawingFontBold, false);
    t.is(runtime.drawingFontItalic, false);
    t.is(runtime.drawingFontFamily, 'Arial, Helvetica, sans-serif');

    t.deepEqual(runtime.resetElements(), null);
});


test('script library, drawVLine', (t) => {
    const runtime = testRuntime();
    markdownScriptFunctions.setDrawingSize([50, 50], runtime.options);
    markdownScriptFunctions.drawMove([25, 0], runtime.options);
    markdownScriptFunctions.drawVLine([50], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 25.00000000 0.00000000 V 50.00000000',
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': 1
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, getDrawingHeight', (t) => {
    const runtime = testRuntime();
    t.is(markdownScriptFunctions.getDrawingHeight([], runtime.options), 200);
});


test('script library, getDrawingWidth', (t) => {
    const runtime = testRuntime();
    t.is(markdownScriptFunctions.getDrawingWidth([], runtime.options), 300);
});


test('script library, getTextHeight', (t) => {
    const runtime = testRuntime();
    t.is(Math.round(markdownScriptFunctions.getTextHeight(['Hello', 50], runtime.options) * 1000) / 1000, 16.667);
    t.is(markdownScriptFunctions.getTextHeight(['', 0], runtime.options), 16);
});


test('script library, getTextWidth', (t) => {
    const runtime = testRuntime();
    t.is(markdownScriptFunctions.getTextWidth(['Hello', 16], runtime.options), 48);
});


test('script library, setDrawingSize', (t) => {
    const runtime = testRuntime();
    t.is(markdownScriptFunctions.getDrawingWidth([], runtime.options), 300);
    t.is(markdownScriptFunctions.getDrawingHeight([], runtime.options), 200);
    t.is(runtime.resetElements(), null);
    markdownScriptFunctions.setDrawingSize([50, 50], runtime.options);
    t.is(markdownScriptFunctions.getDrawingWidth([], runtime.options), 50);
    t.is(markdownScriptFunctions.getDrawingHeight([], runtime.options), 50);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': []
            }
        }
    ]);
});


//
// Element Model functions
//


test('script library, elementModelRender', (t) => {
    const runtime = testRuntime();
    const elements = [
        {'html': 'p', 'elem': {'text': 'Text 1'}},
        {'html': 'p', 'elem': {'text': 'Text 2'}}
    ];
    markdownScriptFunctions.elementModelRender([elements], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        [
            {'html': 'p', 'elem': {'text': 'Text 1'}},
            {'html': 'p', 'elem': {'text': 'Text 2'}}
        ]
    ]);
});


test('script library, elementModelRender callback', async (t) => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    // Event handler function
    const eventHandlerCodes = [];
    const eventHandler = ([keyCode], options) => {
        t.not(options, null);
        eventHandlerCodes.push(keyCode);
    };

    // Render the element model
    const elementModel = [
        {
            'html': 'input',
            'attr': {'id': 'test-input', 'type': 'text', 'value': 'The text'},
            'callback': {
                'keyup': eventHandler
            }
        }
    ];
    markdownScriptFunctions.elementModelRender([elementModel], runtime.options);
    const elements = runtime.resetElements();
    const elementCallback = elements[0][0].callback;
    t.is(typeof elementCallback, 'function');
    t.is(elementCallback.constructor.name, 'Function');
    delete elements[0][0].callback;
    t.deepEqual(elements, [
        [
            {
                'html': 'input',
                'attr': {'id': 'test-input', 'type': 'text', 'value': 'The text'}
            }
        ]
    ]);
    t.deepEqual(eventHandlerCodes, []);
    t.is(runtimeUpdateCount, 0);

    // Call the element callback
    const mockElementEvents = {};
    const mockElement = {
        'addEventListener': (eventType, eventCallback) => {
            mockElementEvents[eventType] = eventCallback;
        }
    };
    elementCallback(mockElement);
    t.is(typeof mockElementEvents.keyup, 'function');
    t.is(mockElementEvents.keyup.constructor.name, 'AsyncFunction');
    t.deepEqual(eventHandlerCodes, []);
    t.is(runtimeUpdateCount, 0);

    // Call the element handler function
    const mockEvent = {'keyCode': 13};
    await mockElementEvents.keyup(mockEvent);
    t.deepEqual(eventHandlerCodes, [13]);
    t.is(runtimeUpdateCount, 1);
});


test('script library, elementModelRender callback async', async (t) => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    // Event handler function
    let clickCount = 0;
    // eslint-disable-next-line require-await
    const eventHandler = async (args, options) => {
        t.not(options, null);
        clickCount += 1;
    };

    // Render the element model
    const elementModel = [
        {
            'html': 'a',
            'attr': {'style': 'cursor: pointer; user-select: none;'},
            'elem': {'text': 'Click Me'},
            'callback': {'click': eventHandler}
        }
    ];
    markdownScriptFunctions.elementModelRender([elementModel], runtime.options);
    const elements = runtime.resetElements();
    const elementCallback = elements[0][0].callback;
    t.is(typeof elementCallback, 'function');
    t.is(elementCallback.constructor.name, 'Function');
    delete elements[0][0].callback;
    t.deepEqual(elements, [
        [
            {
                'html': 'a',
                'attr': {'style': 'cursor: pointer; user-select: none;'},
                'elem': {'text': 'Click Me'}
            }
        ]
    ]);
    t.deepEqual(clickCount, 0);
    t.is(runtimeUpdateCount, 0);

    // Call the element callback
    const mockElementEvents = {};
    const mockElement = {
        'addEventListener': (eventType, eventCallback) => {
            mockElementEvents[eventType] = eventCallback;
        }
    };
    elementCallback(mockElement);
    t.is(typeof mockElementEvents.click, 'function');
    t.is(mockElementEvents.click.constructor.name, 'AsyncFunction');
    t.deepEqual(clickCount, 0);
    t.is(runtimeUpdateCount, 0);

    // Call the element handler function
    const mockEvent = {};
    await mockElementEvents.click(mockEvent);
    t.deepEqual(clickCount, 1);
    t.is(runtimeUpdateCount, 1);
});


test('script library, elementModelRender callback error', async (t) => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;
    const logs = [];
    runtime.options.logFn = (message) => logs.push(message);

    // Event handler function
    let clickCount = 0;
    const eventHandler = (args, options) => {
        t.not(options, null);
        clickCount += 1;
        throw new Error('BOOM!');
    };

    // Render the element model
    const elementModel = [
        {
            'html': 'a',
            'attr': {'style': 'cursor: pointer; user-select: none;'},
            'elem': {'text': 'Click Me'},
            'callback': {'click': eventHandler}
        }
    ];
    markdownScriptFunctions.elementModelRender([elementModel], runtime.options);
    const elements = runtime.resetElements();
    const elementCallback = elements[0][0].callback;
    t.is(typeof elementCallback, 'function');
    t.is(elementCallback.constructor.name, 'Function');
    delete elements[0][0].callback;
    t.deepEqual(elements, [
        [
            {
                'html': 'a',
                'attr': {'style': 'cursor: pointer; user-select: none;'},
                'elem': {'text': 'Click Me'}
            }
        ]
    ]);
    t.deepEqual(clickCount, 0);
    t.is(runtimeUpdateCount, 0);

    // Call the element callback
    const mockElementEvents = {};
    const mockElement = {
        'addEventListener': (eventType, eventCallback) => {
            mockElementEvents[eventType] = eventCallback;
        }
    };
    elementCallback(mockElement);
    t.is(typeof mockElementEvents.click, 'function');
    t.is(mockElementEvents.click.constructor.name, 'AsyncFunction');
    t.deepEqual(clickCount, 0);
    t.is(runtimeUpdateCount, 0);
    t.deepEqual(logs, []);

    // Call the element handler function
    const mockEvent = {};
    await mockElementEvents.click(mockEvent);
    t.deepEqual(clickCount, 1);
    t.is(runtimeUpdateCount, 1);
    t.deepEqual(logs, ['MarkdownUp: Error executing elementModelRender callback: BOOM!']);
});


//
// Local storage functions
//


test('script library, localStorageClear', (t) => {
    const runtime = testRuntime();
    runtime.options.window.localStorage.setItem('foo', 'bar');
    t.is(runtime.options.window.localStorage.getItem('foo'), 'bar');
    markdownScriptFunctions.localStorageClear([], runtime.options);
    t.is(runtime.options.window.localStorage.getItem('foo'), null);
});


test('script library, localStorageGet', (t) => {
    const runtime = testRuntime();
    t.is(markdownScriptFunctions.localStorageGet(['foo'], runtime.options), null);
    runtime.options.window.localStorage.setItem('foo', 'bar');
    t.is(markdownScriptFunctions.localStorageGet(['foo'], runtime.options), 'bar');
});


test('script library, localStorageSet', (t) => {
    const runtime = testRuntime();
    t.is(runtime.options.window.localStorage.getItem('foo'), null);
    markdownScriptFunctions.localStorageSet(['foo', 'bar'], runtime.options);
    t.is(runtime.options.window.localStorage.getItem('foo'), 'bar');
});


test('script library, localStorageRemove', (t) => {
    const runtime = testRuntime();
    runtime.options.window.localStorage.setItem('foo', 'bar');
    t.is(runtime.options.window.localStorage.getItem('foo'), 'bar');
    markdownScriptFunctions.localStorageRemove(['foo'], runtime.options);
    t.is(runtime.options.window.localStorage.getItem('foo'), null);
});


//
// Markdown functions
//


test('script library, markdownEscape', (t) => {
    const runtime = testRuntime();
    t.is(markdownScriptFunctions.markdownEscape(['Hello*World!'], runtime.options), 'Hello\\*World!');
});


test('script library, markdownHeaderId', (t) => {
    const runtime = testRuntime();
    t.is(markdownScriptFunctions.markdownHeaderId(['Hello*World!'], runtime.options), 'hello-world');
});


test('script library, markdownParse', (t) => {
    const runtime = testRuntime();
    t.deepEqual(markdownScriptFunctions.markdownParse(['# Title', '', 'Hello'], runtime.options), {
        'parts': [
            {'paragraph': {'style': 'h1', 'spans': [{'text': 'Title'}]}},
            {'paragraph': {'spans': [{'text': 'Hello'}]}}
        ]
    });
});


test('script library, markdownPrint', (t) => {
    const runtime = testRuntime();
    markdownScriptFunctions.markdownPrint(['# Title', ['', 'Hello\n\nWorld!']], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        [
            {
                'html': 'h1',
                'attr': {'id': 'foo/#title'},
                'elem': [
                    {'text': 'Title'}
                ]
            },
            {
                'html': 'p',
                'elem': [{'text': 'Hello'}]
            },
            {
                'html': 'p',
                'elem': [{'text': 'World!'}]
            }
        ]
    ]);
});


test('script library, markdownTitle', (t) => {
    const runtime = testRuntime();
    const markdownModel = markdownScriptFunctions.markdownParse(['# Title', '', 'Hello'], runtime.options);
    t.is(markdownScriptFunctions.markdownTitle([markdownModel], runtime.options), 'Title');
});


//
// Schema functions
//


test('script library, schemaElements', (t) => {
    const runtime = testRuntime();
    runtime.options.params = '';
    const types = parseSchemaMarkdown(['# My struct', 'struct MyStruct', '', '  # An integer\n  int a']);
    const elements = markdownScriptFunctions.schemaElements([types, 'MyStruct'], runtime.options);
    t.deepEqual(elements, [
        [
            {'html': 'h1', 'attr': {'id': 'type_MyStruct'}, 'elem': {'text': 'struct MyStruct'}},
            null,
            [
                {'html': 'p', 'elem': [{'text': 'My struct'}]}
            ],
            {
                'html': 'table',
                'elem': [
                    {
                        'html': 'tr',
                        'elem': [
                            {'html': 'th', 'elem': {'text': 'Name'}},
                            {'html': 'th', 'elem': {'text': 'Type'}},
                            null,
                            {'html': 'th', 'elem': {'text': 'Description'}}
                        ]
                    },
                    [
                        {
                            'html': 'tr',
                            'elem': [
                                {'html': 'td', 'elem': {'text': 'a'}},
                                {'html': 'td', 'elem': {'text': 'int'}},
                                null,
                                {'html': 'td', 'elem': [{'html': 'p', 'elem': [{'text': 'An integer'}]}]}
                            ]
                        }
                    ]
                ]
            }
        ],
        null
    ]);
});


test('script library, schemaElements action URLs', (t) => {
    const runtime = testRuntime();
    runtime.options.params = '';
    const types = parseSchemaMarkdown(['# My action', 'action MyAction', '  urls', '  GET /']);
    const elements = markdownScriptFunctions.schemaElements([types, 'MyAction', [{'method': 'POST', 'path': '/foo'}]], runtime.options);
    t.deepEqual(elements, [
        [
            {'html': 'h1', 'attr': {'id': 'type_MyAction'}, 'elem': {'text': 'action MyAction'}},
            [
                {'html': 'p', 'elem': [{'text': 'My action'}]}
            ],
            [
                {
                    'html': 'p',
                    'elem': [
                        {'html': 'b', 'elem': {'text': 'Note: '}},
                        {'text': 'The request is exposed at the following URL:'}
                    ]
                },
                [
                    {'html': 'p', 'elem': [{'text': '  '}, {'html': 'a', 'attr': {'href': '/foo'}, 'elem': {'text': 'POST /foo'}}]}
                ]
            ],
            null,
            null,
            null,
            null,
            [
                {'html': 'h2', 'attr': {'id': 'type_MyAction_errors'}, 'elem': {'text': 'Error Codes'}},
                null,
                null,
                [
                    {'html': 'p', 'elem': [{'text': 'If an application error occurs, the response is of the form:'}]},
                    {
                        'html': 'pre',
                        'elem': {
                            'html': 'code',
                            'elem': [
                                {'text': '{\n'},
                                {'text': '    "error": "<code>",\n'},
                                {'text': '    "message": "<message>"\n'},
                                {'text': '}\n'}
                            ]
                        }
                    },
                    {'html': 'p', 'elem': [{'text': '"message" is optional. "<code>" is one of the following values:'}]}
                ],
                {
                    'html': 'table',
                    'elem': [
                        {
                            'html': 'tr',
                            'elem': [
                                {'html': 'th', 'elem': {'text': 'Value'}},
                                {'html': 'th', 'elem': {'text': 'Description'}}
                            ]
                        },
                        [
                            {
                                'html': 'tr',
                                'elem': [
                                    {'html': 'td', 'elem': {'text': 'UnexpectedError'}},
                                    {
                                        'html': 'td',
                                        'elem': [
                                            {'html': 'p', 'elem': [{'text': 'An unexpected error occurred while processing the request'}]}
                                        ]
                                    }
                                ]
                            }
                        ]
                    ]
                }
            ]
        ],
        null
    ]);
});


//
// Session storage functions
//


test('script library, sessionStorageClear', (t) => {
    const runtime = testRuntime();
    runtime.options.window.sessionStorage.setItem('foo', 'bar');
    t.is(runtime.options.window.sessionStorage.getItem('foo'), 'bar');
    markdownScriptFunctions.sessionStorageClear([], runtime.options);
    t.is(runtime.options.window.sessionStorage.getItem('foo'), null);
});


test('script library, sessionStorageGet', (t) => {
    const runtime = testRuntime();
    t.is(markdownScriptFunctions.sessionStorageGet(['foo'], runtime.options), null);
    runtime.options.window.sessionStorage.setItem('foo', 'bar');
    t.is(markdownScriptFunctions.sessionStorageGet(['foo'], runtime.options), 'bar');
});


test('script library, sessionStorageSet', (t) => {
    const runtime = testRuntime();
    t.is(runtime.options.window.sessionStorage.getItem('foo'), null);
    markdownScriptFunctions.sessionStorageSet(['foo', 'bar'], runtime.options);
    t.is(runtime.options.window.sessionStorage.getItem('foo'), 'bar');
});


test('script library, sessionStorageRemove', (t) => {
    const runtime = testRuntime();
    runtime.options.window.sessionStorage.setItem('foo', 'bar');
    t.is(runtime.options.window.sessionStorage.getItem('foo'), 'bar');
    markdownScriptFunctions.sessionStorageRemove(['foo'], runtime.options);
    t.is(runtime.options.window.sessionStorage.getItem('foo'), null);
});
