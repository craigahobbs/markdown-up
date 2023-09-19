// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {JSDOM} from 'jsdom/lib/api.js';
import {MarkdownScriptRuntime} from '../lib/script.js';
import {strict as assert} from 'node:assert';
import {markdownScriptFunctions} from '../lib/scriptLibrary.js';
import {parseSchemaMarkdown} from 'schema-markdown/lib/parser.js';
import test from 'node:test';


// Generic test runtime options
const testRuntime = () => {
    const {window} = new JSDOM('', {'url': 'https://github.com/craigahobbs/markdown-up'});
    const options = {
        'debug': true,
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


test('script library, dataLineChart', () => {
    const runtime = testRuntime();
    const data = [
        {'a': 1, 'b': 3},
        {'a': 2, 'b': 1}
    ];
    const lineChart = {'x': 'a', 'y': ['b']};
    assert.deepEqual(markdownScriptFunctions.dataLineChart([data, lineChart], runtime.options), undefined);
    assert.equal(runtime.drawingWidth, 640);
    assert.equal(runtime.drawingHeight, 320);
    assert.deepEqual(runtime.resetElements(), [
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


test('script library, dataTable', () => {
    const runtime = testRuntime();
    const data = [
        {'a': 1, 'b': 3},
        {'a': 2, 'b': 1}
    ];
    assert.deepEqual(markdownScriptFunctions.dataTable([data], runtime.options), undefined);
    assert.deepEqual(runtime.resetElements(), [
        {
            'html': 'table',
            'elem': [
                {
                    'html': 'tr',
                    'elem': [
                        [],
                        [
                            {'html': 'th', 'attr': null, 'elem': {'text': 'a'}},
                            {'html': 'th', 'attr': null, 'elem': {'text': 'b'}}
                        ]
                    ]
                },
                [
                    {
                        'html': 'tr',
                        'elem': [
                            [],
                            [
                                {'html': 'td', 'attr': null, 'elem': {'text': '1'}},
                                {'html': 'td', 'attr': null, 'elem': {'text': '3'}}
                            ]
                        ]
                    },
                    {
                        'html': 'tr',
                        'elem': [
                            [],
                            [
                                {'html': 'td', 'attr': null, 'elem': {'text': '2'}},
                                {'html': 'td', 'attr': null, 'elem': {'text': '1'}}
                            ]
                        ]
                    }
                ]
            ]
        }
    ]);
});


test('script library, dataTable model', () => {
    const runtime = testRuntime();
    const data = [
        {'a': 1, 'b': 3},
        {'a': 2, 'b': 1}
    ];
    const dataTable = {'fields': ['a']};
    assert.deepEqual(markdownScriptFunctions.dataTable([data, dataTable], runtime.options), undefined);
    assert.deepEqual(runtime.resetElements(), [
        {
            'html': 'table',
            'elem': [
                {
                    'html': 'tr',
                    'elem': [
                        [],
                        [
                            {'html': 'th', 'attr': null, 'elem': {'text': 'a'}}
                        ]
                    ]
                },
                [
                    {
                        'html': 'tr',
                        'elem': [
                            [],
                            [
                                {'html': 'td', 'attr': null, 'elem': {'text': '1'}}
                            ]
                        ]
                    },
                    {
                        'html': 'tr',
                        'elem': [
                            [],
                            [
                                {'html': 'td', 'attr': null, 'elem': {'text': '2'}}
                            ]
                        ]
                    }
                ]
            ]
        }
    ]);
});


//
// Document functions
//


test('script library, documentFontSize', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.documentFontSize([], runtime.options), 16);
});


test('script library, documentInputValue', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.documentInputValue(['test-input'], runtime.options), null);
    runtime.options.window.document.body.innerHTML = '<div id="test-input"/>';
    assert.equal(markdownScriptFunctions.documentInputValue(['test-input'], runtime.options), null);
    runtime.options.window.document.body.innerHTML = '<input id="test-input" type="text" value="The text"/>';
    assert.equal(markdownScriptFunctions.documentInputValue(['test-input'], runtime.options), 'The text');
});


test('script library, documentSetFocus', () => {
    const runtime = testRuntime();
    assert.equal(runtime.documentFocus, null);
    markdownScriptFunctions.documentSetFocus(['test-input'], runtime.options);
    assert.equal(runtime.documentFocus, 'test-input');
});


test('script library, documentSetReset', () => {
    const runtime = testRuntime();
    assert.equal(runtime.documentReset, null);
    assert.equal(markdownScriptFunctions.documentSetReset(['resetID'], runtime.options), undefined);
    assert.equal(runtime.documentReset, 'resetID');
});


test('script library, documentSetTitle', () => {
    const runtime = testRuntime();
    assert.equal(runtime.documentTitle, null);
    markdownScriptFunctions.documentSetTitle(['The Title'], runtime.options);
    assert.equal(runtime.documentTitle, 'The Title');
});


test('script library, documentURL', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.documentURL(['/foo/bar/'], runtime.options), '/foo/bar/');
    assert.equal(markdownScriptFunctions.documentURL(['bar/'], runtime.options), '/foo/bar/');
});


//
// Drawing functions
//


test('script library, drawArc', () => {
    const runtime = testRuntime();
    markdownScriptFunctions.drawNew([100, 50], runtime.options);
    markdownScriptFunctions.drawMove([0, 25], runtime.options);
    markdownScriptFunctions.drawArc([25, 25, 0, 0, 0, 50, 25], runtime.options);
    markdownScriptFunctions.drawArc([25, 25, 0, 1, 1, 100, 25], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
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


test('script library, drawCircle', () => {
    const runtime = testRuntime();
    markdownScriptFunctions.drawNew([50, 50], runtime.options);
    markdownScriptFunctions.drawCircle([25, 25, 25], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
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


test('script library, drawClose', () => {
    const runtime = testRuntime();
    markdownScriptFunctions.drawNew([50, 50], runtime.options);
    markdownScriptFunctions.drawMove([0, 0], runtime.options);
    markdownScriptFunctions.drawLine([50, 0], runtime.options);
    markdownScriptFunctions.drawLine([50, 50], runtime.options);
    markdownScriptFunctions.drawClose([], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
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


test('script library, drawEllipse', () => {
    const runtime = testRuntime();
    markdownScriptFunctions.drawNew([50, 40], runtime.options);
    markdownScriptFunctions.drawEllipse([25, 20, 25, 20], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
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


test('script library, drawHLine', () => {
    const runtime = testRuntime();
    markdownScriptFunctions.drawNew([50, 50], runtime.options);
    markdownScriptFunctions.drawMove([0, 25], runtime.options);
    markdownScriptFunctions.drawHLine([50], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
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


test('script library, drawHeight', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.drawHeight([], runtime.options), 200);
});


test('script library, drawImage', () => {
    const runtime = testRuntime();
    markdownScriptFunctions.drawNew([50, 50], runtime.options);
    markdownScriptFunctions.drawImage([15, 15, 25, 25, '/foo/bar.jpg'], runtime.options);
    markdownScriptFunctions.drawImage([35, 35, 25, 25, 'bar.jpg'], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
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


test('script library, drawLine', () => {
    const runtime = testRuntime();
    markdownScriptFunctions.drawNew([50, 50], runtime.options);
    markdownScriptFunctions.drawMove([0, 0], runtime.options);
    markdownScriptFunctions.drawLine([50, 0], runtime.options);
    markdownScriptFunctions.drawLine([50, 50], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
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


test('script library, drawMove', () => {
    const runtime = testRuntime();
    markdownScriptFunctions.drawNew([50, 50], runtime.options);
    markdownScriptFunctions.drawMove([0, 0], runtime.options);
    markdownScriptFunctions.drawLine([50, 0], runtime.options);
    markdownScriptFunctions.drawMove([0, 50], runtime.options);
    markdownScriptFunctions.drawLine([50, 50], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
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


test('script library, drawOnClick', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    // Test click handler function
    let clickCount = 0;
    const clickHandler = ([px, py], options) => {
        assert.equal(px, 5);
        assert.equal(py, 10);
        assert.notEqual(options, null);
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
    markdownScriptFunctions.drawNew([50, 50], runtime.options);
    markdownScriptFunctions.drawRect([0, 0, 50, 50], runtime.options);
    markdownScriptFunctions.drawOnClick([clickHandler], runtime.options);

    // Get the runtime elements
    const elements = runtime.resetElements();
    assert.equal(typeof elements[0].elem.elem[0].callback, 'function');
    elements[0].elem.elem[0].callback(element);
    assert.equal(typeof elementEvents.click, 'function');
    assert.equal(elementEvents.click.constructor.name, 'AsyncFunction');

    // Click the rect
    await elementEvents.click(event);
    assert.equal(clickCount, 1);
    assert.equal(runtimeUpdateCount, 1);
});


test('script library, drawOnClick async', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    // Test click handler function
    let clickCount = 0;
    // eslint-disable-next-line require-await
    const clickHandler = async ([px, py], options) => {
        assert.equal(px, 5);
        assert.equal(py, 10);
        assert.notEqual(options, null);
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
    markdownScriptFunctions.drawNew([50, 50], runtime.options);
    markdownScriptFunctions.drawRect([0, 0, 50, 50], runtime.options);
    markdownScriptFunctions.drawOnClick([clickHandler], runtime.options);

    // Get the runtime elements
    const elements = runtime.resetElements();
    assert.equal(typeof elements[0].elem.elem[0].callback, 'function');
    elements[0].elem.elem[0].callback(element);
    assert.equal(typeof elementEvents.click, 'function');
    assert.equal(elementEvents.click.constructor.name, 'AsyncFunction');

    // Click the rect
    await elementEvents.click(event);
    assert.equal(clickCount, 1);
    assert.equal(runtimeUpdateCount, 1);
});


test('script library, drawOnClick callback error', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;
    const logs = [];
    runtime.options.logFn = (message) => logs.push(message);

    // Test click handler function
    let clickCount = 0;
    const clickHandler = ([px, py], options) => {
        assert.equal(px, 5);
        assert.equal(py, 10);
        assert.notEqual(options, null);
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
    markdownScriptFunctions.drawNew([50, 50], runtime.options);
    markdownScriptFunctions.drawRect([0, 0, 50, 50], runtime.options);
    markdownScriptFunctions.drawOnClick([clickHandler], runtime.options);

    // Get the runtime elements
    const elements = runtime.resetElements();
    assert.equal(typeof elements[0].elem.elem[0].callback, 'function');
    elements[0].elem.elem[0].callback(element);
    assert.equal(typeof elementEvents.click, 'function');
    assert.equal(elementEvents.click.constructor.name, 'AsyncFunction');

    // Click the rect
    assert.equal(clickCount, 0);
    assert.deepEqual(logs, []);
    await elementEvents.click(event);
    assert.equal(clickCount, 1);
    assert.deepEqual(logs, ['MarkdownUp: Error executing drawOnClick callback: BOOM!']);
    assert.equal(runtimeUpdateCount, 1);
});


test('script library, drawOnClick drawing click', () => {
    const runtime = testRuntime();
    markdownScriptFunctions.drawNew([50, 50], runtime.options);
    markdownScriptFunctions.drawOnClick([null], runtime.options);
    const elements = runtime.resetElements();
    assert.equal(typeof elements[0].elem.callback, 'function');
    delete elements[0].elem.callback;
    assert.deepEqual(elements, [
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


test('script library, drawPathRect', () => {
    const runtime = testRuntime();
    markdownScriptFunctions.drawNew([50, 50], runtime.options);
    markdownScriptFunctions.drawPathRect([0, 0, 50, 50], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 0.00000000 0.00000000 H 50.00000000 V 50.00000000 H 0.00000000 Z',
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


test('script library, drawRect', () => {
    const runtime = testRuntime();
    markdownScriptFunctions.drawNew([50, 50], runtime.options);
    markdownScriptFunctions.drawRect([0, 0, 50, 50, 5, 5], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
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


test('script library, drawNew', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.drawWidth([], runtime.options), 300);
    assert.equal(markdownScriptFunctions.drawHeight([], runtime.options), 200);
    assert.equal(runtime.resetElements(), null);
    markdownScriptFunctions.drawNew([50, 50], runtime.options);
    assert.equal(markdownScriptFunctions.drawWidth([], runtime.options), 50);
    assert.equal(markdownScriptFunctions.drawHeight([], runtime.options), 50);
    assert.deepEqual(runtime.resetElements(), [
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


test('script library, drawStyle', () => {
    const runtime = testRuntime();

    markdownScriptFunctions.drawNew([50, 50], runtime.options);
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

    assert.equal(runtime.drawingPathStroke, 'red');
    assert.equal(runtime.drawingPathStrokeWidth, 2);
    assert.equal(runtime.drawingPathFill, 'blue');
    assert.equal(runtime.drawingPathStrokeDashArray, '4 1');

    assert.deepEqual(runtime.resetElements(), [
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


test('script library, drawStyle no drawing', () => {
    const runtime = testRuntime();

    assert.equal(runtime.drawingPathStroke, 'black');
    assert.equal(runtime.drawingPathStrokeWidth, 1);
    assert.equal(runtime.drawingPathFill, 'none');
    assert.equal(runtime.drawingPathStrokeDashArray, 'none');

    markdownScriptFunctions.drawStyle(['red', 2, 'blue', '4 1'], runtime.options);

    assert.equal(runtime.drawingPathStroke, 'red');
    assert.equal(runtime.drawingPathStrokeWidth, 2);
    assert.equal(runtime.drawingPathFill, 'blue');
    assert.equal(runtime.drawingPathStrokeDashArray, '4 1');

    markdownScriptFunctions.drawStyle([], runtime.options);

    assert.equal(runtime.drawingPathStroke, 'black');
    assert.equal(runtime.drawingPathStrokeWidth, 1);
    assert.equal(runtime.drawingPathFill, 'none');
    assert.equal(runtime.drawingPathStrokeDashArray, 'none');

    assert.deepEqual(runtime.resetElements(), [
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


test('script library, drawText', () => {
    const runtime = testRuntime();
    markdownScriptFunctions.drawNew([50, 50], runtime.options);
    markdownScriptFunctions.drawText(['Hello', 25, 15], runtime.options);
    markdownScriptFunctions.drawTextStyle([null, 'black', true, true], runtime.options);
    markdownScriptFunctions.drawText(['World!', 25, 35], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
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


test('script library, drawTextHeight', () => {
    const runtime = testRuntime();
    assert.equal(Math.round(markdownScriptFunctions.drawTextHeight(['Hello', 50], runtime.options) * 1000) / 1000, 16.667);
    assert.equal(markdownScriptFunctions.drawTextHeight(['', 0], runtime.options), 16);
});


test('script library, drawTextStyle', () => {
    const runtime = testRuntime();

    assert.equal(runtime.drawingFontSizePx, 16);
    assert.equal(runtime.drawingFontFill, 'black');
    assert.equal(runtime.drawingFontBold, false);
    assert.equal(runtime.drawingFontItalic, false);
    assert.equal(runtime.drawingFontFamily, 'Arial, Helvetica, sans-serif');

    markdownScriptFunctions.drawTextStyle([10, 'red', true, true, 'Comic Sans'], runtime.options);

    assert.equal(runtime.drawingFontSizePx, 10);
    assert.equal(runtime.drawingFontFill, 'red');
    assert.equal(runtime.drawingFontBold, true);
    assert.equal(runtime.drawingFontItalic, true);
    assert.equal(runtime.drawingFontFamily, 'Comic Sans');

    markdownScriptFunctions.drawTextStyle([], runtime.options);

    assert.equal(runtime.drawingFontSizePx, 16);
    assert.equal(runtime.drawingFontFill, 'black');
    assert.equal(runtime.drawingFontBold, false);
    assert.equal(runtime.drawingFontItalic, false);
    assert.equal(runtime.drawingFontFamily, 'Arial, Helvetica, sans-serif');

    assert.deepEqual(runtime.resetElements(), null);
});


test('script library, drawTextWidth', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.drawTextWidth(['Hello', 16], runtime.options), 48);
});


test('script library, drawVLine', () => {
    const runtime = testRuntime();
    markdownScriptFunctions.drawNew([50, 50], runtime.options);
    markdownScriptFunctions.drawMove([25, 0], runtime.options);
    markdownScriptFunctions.drawVLine([50], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
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


test('script library, drawWidth', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.drawWidth([], runtime.options), 300);
});


//
// Element Model functions
//


test('script library, elementModelRender', () => {
    const runtime = testRuntime();
    const elements = [
        {'html': 'p', 'elem': {'text': 'Text 1'}},
        {'html': 'p', 'elem': {'text': 'Text 2'}}
    ];
    markdownScriptFunctions.elementModelRender([elements], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
        [
            {'html': 'p', 'elem': {'text': 'Text 1'}},
            {'html': 'p', 'elem': {'text': 'Text 2'}}
        ]
    ]);
});


test('script library, elementModelRender null', () => {
    const runtime = testRuntime();
    markdownScriptFunctions.elementModelRender([null], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
        null
    ]);
});


test('script library, elementModelRender callback null', () => {
    const runtime = testRuntime();
    const elements = [
        {'html': 'p', 'elem': {'text': 'Text 1'}, 'callback': null}
    ];
    markdownScriptFunctions.elementModelRender([elements], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
        [
            {'html': 'p', 'elem': {'text': 'Text 1'}, 'callback': null}
        ]
    ]);
});


test('script library, elementModelRender callback', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    // Event handler function
    const eventHandlerCodes = [];
    const eventHandler = ([keyCode], options) => {
        assert.notEqual(options, null);
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
    assert.equal(typeof elementCallback, 'function');
    assert.equal(elementCallback.constructor.name, 'Function');
    delete elements[0][0].callback;
    assert.deepEqual(elements, [
        [
            {
                'html': 'input',
                'attr': {'id': 'test-input', 'type': 'text', 'value': 'The text'}
            }
        ]
    ]);
    assert.deepEqual(eventHandlerCodes, []);
    assert.equal(runtimeUpdateCount, 0);

    // Call the element callback
    const mockElementEvents = {};
    const mockElement = {
        'addEventListener': (eventType, eventCallback) => {
            mockElementEvents[eventType] = eventCallback;
        }
    };
    elementCallback(mockElement);
    assert.equal(typeof mockElementEvents.keyup, 'function');
    assert.equal(mockElementEvents.keyup.constructor.name, 'AsyncFunction');
    assert.deepEqual(eventHandlerCodes, []);
    assert.equal(runtimeUpdateCount, 0);

    // Call the element handler function
    const mockEvent = {'keyCode': 13};
    await mockElementEvents.keyup(mockEvent);
    assert.deepEqual(eventHandlerCodes, [13]);
    assert.equal(runtimeUpdateCount, 1);
});


test('script library, elementModelRender callback data', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    // Event handler function
    const onClickArgs = [];
    const onClick = ([data], options) => {
        assert.notEqual(options, null);
        onClickArgs.push(data);
    };

    // Render the element model
    const elementModel = [
        {
            'html': 'a',
            'elem': {'text': 'Click me!'},
            'callback': {'click': onClick},
            'callbackData': 'hello!'
        }
    ];
    markdownScriptFunctions.elementModelRender([elementModel], runtime.options);
    const elements = runtime.resetElements();
    const elementCallback = elements[0][0].callback;
    assert.equal(typeof elementCallback, 'function');
    assert.equal(elementCallback.constructor.name, 'Function');
    delete elements[0][0].callback;
    assert.deepEqual(elements, [
        [
            {'html': 'a', 'elem': {'text': 'Click me!'}}
        ]
    ]);
    assert.deepEqual(onClickArgs, []);
    assert.equal(runtimeUpdateCount, 0);

    // Call the element callback
    const mockElementEvents = {};
    const mockElement = {
        'addEventListener': (eventType, eventCallback) => {
            mockElementEvents[eventType] = eventCallback;
        }
    };
    elementCallback(mockElement);
    assert.equal(typeof mockElementEvents.click, 'function');
    assert.equal(mockElementEvents.click.constructor.name, 'AsyncFunction');
    assert.deepEqual(onClickArgs, []);
    assert.equal(runtimeUpdateCount, 0);

    // Call the element handler function
    const mockEvent = {};
    await mockElementEvents.click(mockEvent);
    assert.deepEqual(onClickArgs, ['hello!']);
    assert.equal(runtimeUpdateCount, 1);
});


test('script library, elementModelRender callback async', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    // Event handler function
    let clickCount = 0;
    // eslint-disable-next-line require-await
    const eventHandler = async (args, options) => {
        assert.notEqual(options, null);
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
    assert.equal(typeof elementCallback, 'function');
    assert.equal(elementCallback.constructor.name, 'Function');
    delete elements[0][0].callback;
    assert.deepEqual(elements, [
        [
            {
                'html': 'a',
                'attr': {'style': 'cursor: pointer; user-select: none;'},
                'elem': {'text': 'Click Me'}
            }
        ]
    ]);
    assert.deepEqual(clickCount, 0);
    assert.equal(runtimeUpdateCount, 0);

    // Call the element callback
    const mockElementEvents = {};
    const mockElement = {
        'addEventListener': (eventType, eventCallback) => {
            mockElementEvents[eventType] = eventCallback;
        }
    };
    elementCallback(mockElement);
    assert.equal(typeof mockElementEvents.click, 'function');
    assert.equal(mockElementEvents.click.constructor.name, 'AsyncFunction');
    assert.deepEqual(clickCount, 0);
    assert.equal(runtimeUpdateCount, 0);

    // Call the element handler function
    const mockEvent = {};
    await mockElementEvents.click(mockEvent);
    assert.deepEqual(clickCount, 1);
    assert.equal(runtimeUpdateCount, 1);
});


test('script library, elementModelRender callback error', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;
    const logs = [];
    runtime.options.logFn = (message) => logs.push(message);

    // Event handler function
    let clickCount = 0;
    const eventHandler = (args, options) => {
        assert.notEqual(options, null);
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
    assert.equal(typeof elementCallback, 'function');
    assert.equal(elementCallback.constructor.name, 'Function');
    delete elements[0][0].callback;
    assert.deepEqual(elements, [
        [
            {
                'html': 'a',
                'attr': {'style': 'cursor: pointer; user-select: none;'},
                'elem': {'text': 'Click Me'}
            }
        ]
    ]);
    assert.deepEqual(clickCount, 0);
    assert.equal(runtimeUpdateCount, 0);

    // Call the element callback
    const mockElementEvents = {};
    const mockElement = {
        'addEventListener': (eventType, eventCallback) => {
            mockElementEvents[eventType] = eventCallback;
        }
    };
    elementCallback(mockElement);
    assert.equal(typeof mockElementEvents.click, 'function');
    assert.equal(mockElementEvents.click.constructor.name, 'AsyncFunction');
    assert.deepEqual(clickCount, 0);
    assert.equal(runtimeUpdateCount, 0);
    assert.deepEqual(logs, []);

    // Call the element handler function
    const mockEvent = {};
    await mockElementEvents.click(mockEvent);
    assert.deepEqual(clickCount, 1);
    assert.equal(runtimeUpdateCount, 1);
    assert.deepEqual(logs, ['MarkdownUp: Error executing elementModelRender callback: BOOM!']);
});


//
// Local storage functions
//


test('script library, localStorageClear', () => {
    const runtime = testRuntime();
    runtime.options.window.localStorage.setItem('foo', 'bar');
    assert.equal(runtime.options.window.localStorage.getItem('foo'), 'bar');
    markdownScriptFunctions.localStorageClear([], runtime.options);
    assert.equal(runtime.options.window.localStorage.getItem('foo'), null);
});


test('script library, localStorageGet', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.localStorageGet(['foo'], runtime.options), null);
    runtime.options.window.localStorage.setItem('foo', 'bar');
    assert.equal(markdownScriptFunctions.localStorageGet(['foo'], runtime.options), 'bar');
});


test('script library, localStorageSet', () => {
    const runtime = testRuntime();
    assert.equal(runtime.options.window.localStorage.getItem('foo'), null);
    markdownScriptFunctions.localStorageSet(['foo', 'bar'], runtime.options);
    assert.equal(runtime.options.window.localStorage.getItem('foo'), 'bar');
});


test('script library, localStorageRemove', () => {
    const runtime = testRuntime();
    runtime.options.window.localStorage.setItem('foo', 'bar');
    assert.equal(runtime.options.window.localStorage.getItem('foo'), 'bar');
    markdownScriptFunctions.localStorageRemove(['foo'], runtime.options);
    assert.equal(runtime.options.window.localStorage.getItem('foo'), null);
});


//
// Markdown functions
//


test('script library, markdownEscape', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.markdownEscape(['Hello*World!'], runtime.options), 'Hello\\*World!');
});


test('script library, markdownHeaderId', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.markdownHeaderId(['Hello*World!'], runtime.options), 'hello-world');
});


test('script library, markdownParse', () => {
    const runtime = testRuntime();
    assert.deepEqual(markdownScriptFunctions.markdownParse(['# Title', '', 'Hello'], runtime.options), {
        'parts': [
            {'paragraph': {'style': 'h1', 'spans': [{'text': 'Title'}]}},
            {'paragraph': {'spans': [{'text': 'Hello'}]}}
        ]
    });
});


test('script library, markdownPrint', () => {
    const runtime = testRuntime();
    markdownScriptFunctions.markdownPrint(['# Title', ['', 'Hello\n\nWorld!']], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
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


test('script library, markdownTitle', () => {
    const runtime = testRuntime();
    const markdownModel = markdownScriptFunctions.markdownParse(['# Title', '', 'Hello'], runtime.options);
    assert.equal(markdownScriptFunctions.markdownTitle([markdownModel], runtime.options), 'Title');
});


//
// Schema functions
//


test('script library, schemaElements', () => {
    const runtime = testRuntime();
    runtime.options.params = '';
    const types = parseSchemaMarkdown(['# My struct', 'struct MyStruct', '', '  # An integer\n  int a']);
    const elements = markdownScriptFunctions.schemaElements([types, 'MyStruct'], runtime.options);
    assert.deepEqual(elements, [
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


test('script library, schemaElements action URLs', () => {
    const runtime = testRuntime();
    runtime.options.params = '';
    const types = parseSchemaMarkdown(['# My action', 'action MyAction', '  urls', '  GET /']);
    const elements = markdownScriptFunctions.schemaElements([types, 'MyAction', [{'method': 'POST', 'path': '/foo'}]], runtime.options);
    assert.deepEqual(elements, [
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


test('script library, sessionStorageClear', () => {
    const runtime = testRuntime();
    runtime.options.window.sessionStorage.setItem('foo', 'bar');
    assert.equal(runtime.options.window.sessionStorage.getItem('foo'), 'bar');
    markdownScriptFunctions.sessionStorageClear([], runtime.options);
    assert.equal(runtime.options.window.sessionStorage.getItem('foo'), null);
});


test('script library, sessionStorageGet', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.sessionStorageGet(['foo'], runtime.options), null);
    runtime.options.window.sessionStorage.setItem('foo', 'bar');
    assert.equal(markdownScriptFunctions.sessionStorageGet(['foo'], runtime.options), 'bar');
});


test('script library, sessionStorageSet', () => {
    const runtime = testRuntime();
    assert.equal(runtime.options.window.sessionStorage.getItem('foo'), null);
    markdownScriptFunctions.sessionStorageSet(['foo', 'bar'], runtime.options);
    assert.equal(runtime.options.window.sessionStorage.getItem('foo'), 'bar');
});


test('script library, sessionStorageRemove', () => {
    const runtime = testRuntime();
    runtime.options.window.sessionStorage.setItem('foo', 'bar');
    assert.equal(runtime.options.window.sessionStorage.getItem('foo'), 'bar');
    markdownScriptFunctions.sessionStorageRemove(['foo'], runtime.options);
    assert.equal(runtime.options.window.sessionStorage.getItem('foo'), null);
});


//
// Window functions
//


test('script library, windowHeight', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.windowHeight([], runtime.options), 768);
});


test('script library, windowSetLocation', () => {
    const runtime = testRuntime();
    assert.equal(runtime.windowLocation, null);
    markdownScriptFunctions.windowSetLocation(['/other'], runtime.options);
    assert.equal(runtime.windowLocation, '/other');
    markdownScriptFunctions.windowSetLocation(['other'], runtime.options);
    assert.equal(runtime.windowLocation, '/foo/other');
});


test('script library, windowSetResize', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    assert.equal(runtime.windowResize, null);
    assert.equal(runtime.options.statementCount, undefined);

    let onsizeCount = 0;
    const onsize = () => ++onsizeCount;
    markdownScriptFunctions.windowSetResize([onsize], runtime.options);

    assert.equal(typeof runtime.windowResize, 'function');
    assert.equal(runtime.windowResize.constructor.name, 'AsyncFunction');
    assert.equal(runtime.options.statementCount, undefined);
    assert.equal(runtimeUpdateCount, 0);
    assert.equal(onsizeCount, 0);

    await runtime.windowResize();
    assert.equal(runtime.options.statementCount, 0);
    assert.equal(runtimeUpdateCount, 1);
    assert.equal(onsizeCount, 1);
});


test('script library, windowSetResize async', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    assert.equal(runtime.windowResize, null);
    assert.equal(runtime.options.statementCount, undefined);

    let onsizeCount = 0;
    // eslint-disable-next-line require-await
    const onsize = async () => ++onsizeCount;
    markdownScriptFunctions.windowSetResize([onsize], runtime.options);

    assert.equal(typeof runtime.windowResize, 'function');
    assert.equal(runtime.windowResize.constructor.name, 'AsyncFunction');
    assert.equal(runtime.options.statementCount, undefined);
    assert.equal(runtimeUpdateCount, 0);
    assert.equal(onsizeCount, 0);

    await runtime.windowResize();
    assert.equal(runtime.options.statementCount, 0);
    assert.equal(runtimeUpdateCount, 1);
    assert.equal(onsizeCount, 1);
});


test('script library, windowSetResize callback error', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;
    const logs = [];
    runtime.options.logFn = (message) => logs.push(message);

    assert.equal(runtime.windowResize, null);
    assert.equal(runtime.options.statementCount, undefined);

    let onsizeCount = 0;
    const onsize = () => {
        ++onsizeCount;
        throw new Error('BOOM!');
    };
    markdownScriptFunctions.windowSetResize([onsize], runtime.options);

    assert.equal(typeof runtime.windowResize, 'function');
    assert.equal(runtime.windowResize.constructor.name, 'AsyncFunction');
    assert.equal(runtime.options.statementCount, undefined);
    assert.equal(runtimeUpdateCount, 0);
    assert.deepEqual(logs, []);
    assert.equal(onsizeCount, 0);

    await runtime.windowResize();
    assert.equal(runtime.options.statementCount, 0);
    assert.equal(runtimeUpdateCount, 1);
    assert.deepEqual(logs, ['MarkdownUp: Error executing windowSetResize callback: BOOM!']);
    assert.equal(onsizeCount, 1);
});


test('script library, windowSetTimeout', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    assert.equal(runtime.windowTimeout, null);
    assert.equal(runtime.options.statementCount, undefined);

    let ontimeCount = 0;
    const ontime = () => ++ontimeCount;
    markdownScriptFunctions.windowSetTimeout([ontime, 1000], runtime.options);

    assert.equal(typeof runtime.windowTimeout[0], 'function');
    assert.equal(runtime.windowTimeout[0].constructor.name, 'AsyncFunction');
    assert.equal(runtime.windowTimeout[1], 1000);
    assert.equal(runtime.options.statementCount, undefined);
    assert.equal(runtimeUpdateCount, 0);
    assert.equal(ontimeCount, 0);

    await runtime.windowTimeout[0]();
    assert.equal(runtime.options.statementCount, 0);
    assert.equal(runtimeUpdateCount, 1);
    assert.equal(ontimeCount, 1);
});


test('script library, windowSetTimeout async', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    assert.equal(runtime.windowTimeout, null);
    assert.equal(runtime.options.statementCount, undefined);

    let ontimeCount = 0;
    // eslint-disable-next-line require-await
    const ontime = async () => ++ontimeCount;
    markdownScriptFunctions.windowSetTimeout([ontime, 1000], runtime.options);

    assert.equal(typeof runtime.windowTimeout[0], 'function');
    assert.equal(runtime.windowTimeout[0].constructor.name, 'AsyncFunction');
    assert.equal(runtime.windowTimeout[1], 1000);
    assert.equal(runtime.options.statementCount, undefined);
    assert.equal(runtimeUpdateCount, 0);
    assert.equal(ontimeCount, 0);

    await runtime.windowTimeout[0]();
    assert.equal(runtime.options.statementCount, 0);
    assert.equal(runtimeUpdateCount, 1);
    assert.equal(ontimeCount, 1);
});


test('script library, windowSetTimeout callback error', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;
    const logs = [];
    runtime.options.logFn = (message) => logs.push(message);

    assert.equal(runtime.windowTimeout, null);
    assert.equal(runtime.options.statementCount, undefined);

    let ontimeCount = 0;
    const ontime = () => {
        ++ontimeCount;
        throw new Error('BOOM!');
    };
    markdownScriptFunctions.windowSetTimeout([ontime, 1000], runtime.options);

    assert.equal(typeof runtime.windowTimeout[0], 'function');
    assert.equal(runtime.windowTimeout[0].constructor.name, 'AsyncFunction');
    assert.equal(runtime.windowTimeout[1], 1000);
    assert.equal(runtime.options.statementCount, undefined);
    assert.equal(runtimeUpdateCount, 0);
    assert.deepEqual(logs, []);
    assert.equal(ontimeCount, 0);

    await runtime.windowTimeout[0]();
    assert.equal(runtime.options.statementCount, 0);
    assert.equal(runtimeUpdateCount, 1);
    assert.deepEqual(logs, ['MarkdownUp: Error executing windowSetTimeout callback: BOOM!']);
    assert.equal(ontimeCount, 1);
});


test('script library, windowWidth', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.windowWidth([], runtime.options), 1024);
});
