// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {JSDOM} from 'jsdom/lib/api.js';
import {MarkdownScriptRuntime} from '../lib/script.js';
import {markdownScriptFunctions} from '../lib/scriptLibrary.js';
import test from 'ava';


/* eslint-disable id-length, max-len */


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


test('script library, functions', (t) => {
    t.deepEqual(
        Object.entries(markdownScriptFunctions).map(([fnName, fn]) => [fnName, typeof fn === 'function']),
        [
            ['documentReset', true],
            ['documentURL', true],
            ['getDocumentFontSize', true],
            ['getDocumentInputValue', true],
            ['getWindowHeight', true],
            ['getWindowWidth', true],
            ['setDocumentFocus', true],
            ['setDocumentTitle', true],
            ['setWindowLocation', true],
            ['setWindowResize', true],
            ['setWindowTimeout', true],
            ['drawArc', true],
            ['drawCircle', true],
            ['drawClose', true],
            ['drawEllipse', true],
            ['drawHLine', true],
            ['drawImage', true],
            ['drawLine', true],
            ['drawMove', true],
            ['drawOnClick', true],
            ['drawRect', true],
            ['drawStyle', true],
            ['drawText', true],
            ['drawTextStyle', true],
            ['drawVLine', true],
            ['getDrawingHeight', true],
            ['getDrawingWidth', true],
            ['getTextHeight', true],
            ['getTextWidth', true],
            ['setDrawingSize', true],
            ['elementModelRender', true],
            ['localStorageClear', true],
            ['localStorageGet', true],
            ['localStorageSet', true],
            ['localStorageRemove', true],
            ['markdownEscape', true],
            ['markdownHeaderId', true],
            ['markdownParse', true],
            ['markdownPrint', true],
            ['markdownTitle', true],
            ['schemaParse', true],
            ['schemaPrint', true],
            ['schemaTypeModel', true],
            ['schemaValidate', true],
            ['schemaValidateTypeModel', true],
            ['sessionStorageClear', true],
            ['sessionStorageGet', true],
            ['sessionStorageSet', true],
            ['sessionStorageRemove', true]
        ]
    );
});


//
// Document functions
//


test('script library, documentReset', (t) => {
    const runtime = testRuntime();
    t.is(runtime.isDocumentReset, false);
    t.is(markdownScriptFunctions.documentReset([], runtime.options), undefined);
    t.is(runtime.isDocumentReset, true);
});


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


test('script library, setWindowResize', (t) => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    t.is(runtime.windowResize, null);
    t.is(runtime.options.statementCount, undefined);

    let onsizeCount = 0;
    const onsize = () => ++onsizeCount;
    markdownScriptFunctions.setWindowResize([onsize], runtime.options);

    t.is(typeof runtime.windowResize, 'function');
    t.is(runtime.options.statementCount, undefined);
    t.is(runtimeUpdateCount, 0);
    t.is(onsizeCount, 0);

    runtime.windowResize();
    t.is(runtime.options.statementCount, 0);
    t.is(runtimeUpdateCount, 1);
    t.is(onsizeCount, 1);
});


test('script library, setWindowTimeout', (t) => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    t.is(runtime.windowTimeout, null);
    t.is(runtime.options.statementCount, undefined);

    let ontimeCount = 0;
    const ontime = () => ++ontimeCount;
    markdownScriptFunctions.setWindowTimeout([ontime, 1000], runtime.options);

    t.is(typeof runtime.windowTimeout[0], 'function');
    t.is(runtime.windowTimeout[1], 1000);
    t.is(runtime.options.statementCount, undefined);
    t.is(runtimeUpdateCount, 0);
    t.is(ontimeCount, 0);

    runtime.windowTimeout[0]();
    t.is(runtime.options.statementCount, 0);
    t.is(runtimeUpdateCount, 1);
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


test('script library, drawOnClick', (t) => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    // Test click handler function
    let clickCount = 0;
    const clickHandler = ([x, y], options) => {
        t.is(x, 5);
        t.is(y, 10);
        t.is(options.fontSize, 12);
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

    markdownScriptFunctions.setDrawingSize([50, 50], runtime.options);
    markdownScriptFunctions.drawRect([0, 0, 50, 50], runtime.options);
    markdownScriptFunctions.drawOnClick([clickHandler], runtime.options);

    const elements = runtime.resetElements();
    t.is(typeof elements[0].elem.elem[0].callback, 'function');
    elements[0].elem.elem[0].callback(element);
    t.is(typeof elementEvents.click, 'function');
    elementEvents.click(event);
    t.is(clickCount, 1);
    t.is(runtimeUpdateCount, 1);

    delete elements[0].elem.elem[0].callback;
    t.deepEqual(elements, [
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
                'attr': {'width': 50, 'height': 50},
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


test('script library, elementModelRender callback', (t) => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    // Event handler function
    const eventHandlerCodes = [];
    const eventHandler = ([keyCode], options) => {
        t.not(options, null);
        eventHandlerCodes.push(keyCode);
    };

    const elementModel = [
        {
            'html': 'input',
            'attr': {
                'id': 'test-input',
                'type': 'text',
                'value': 'The text'
            },
            'callback': {
                'keyup': eventHandler
            }
        }
    ];
    markdownScriptFunctions.elementModelRender([elementModel], runtime.options);

    const elements = runtime.resetElements();
    const elementCallback = elements[0][0].callback;
    t.is(typeof elementCallback, 'function');
    delete elements[0][0].callback;
    t.deepEqual(elements, [
        [
            {
                'html': 'input',
                'attr': {
                    'id': 'test-input',
                    'type': 'text',
                    'value': 'The text'
                }
            }
        ]
    ]);

    // Mock element
    const mockElementEvents = {};
    const mockElement = {
        'addEventListener': (eventType, eventCallback) => {
            mockElementEvents[eventType] = eventCallback;
        }
    };

    elementCallback(mockElement);
    t.is(typeof mockElementEvents.keyup, 'function');

    // Mock event
    const mockEvent = {'keyCode': 13};

    mockElementEvents.keyup(mockEvent);

    t.deepEqual(eventHandlerCodes, [13]);
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


test('script library, schemaParse', (t) => {
    const runtime = testRuntime();
    t.deepEqual(markdownScriptFunctions.schemaParse(['# My struct', 'struct MyStruct', ['', '  # An integer\n  int a']], runtime.options), {
        'MyStruct': {
            'struct': {
                'name': 'MyStruct',
                'doc': ['My struct'],
                'members': [
                    {
                        'name': 'a',
                        'doc': ['An integer'],
                        'type': {'builtin': 'int'}
                    }
                ]
            }
        }
    });
});


test('script library, schemaPrint', (t) => {
    const runtime = testRuntime();
    runtime.options.params = '';
    const types = markdownScriptFunctions.schemaParse(['# My struct', 'struct MyStruct', ['', '  # An integer\n  int a']], runtime.options);
    markdownScriptFunctions.schemaPrint([types, 'MyStruct'], runtime.options);
    const elements = runtime.resetElements();
    t.deepEqual(elements[0][0][0], {
        'html': 'h1',
        'attr': {'id': 'type_MyStruct'},
        'elem': {'text': 'struct MyStruct'}
    });
});


test('script library, schemaPrint action URLs', (t) => {
    const runtime = testRuntime();
    runtime.options.params = '';
    const types = markdownScriptFunctions.schemaParse(['# My action', 'action MyAction', '  urls', '  GET /'], runtime.options);
    markdownScriptFunctions.schemaPrint([types, 'MyAction', [{'method': 'POST', 'path': '/foo'}]], runtime.options);
    const elements = runtime.resetElements();
    t.deepEqual(elements[0][0][2][1][0].elem[1], {
        'html': 'a',
        'attr': {'href': '/foo'},
        'elem': {'text': 'POST /foo'}
    });
});


test('script library, schemaTypeModel', (t) => {
    const runtime = testRuntime();
    t.true('Types' in markdownScriptFunctions.schemaTypeModel([], runtime.options));
});

test('script library, schemaValidate', (t) => {
    const runtime = testRuntime();
    const types = markdownScriptFunctions.schemaParse(['# My struct', 'struct MyStruct', ['', '  # An integer\n  int a']], runtime.options);
    t.deepEqual(markdownScriptFunctions.schemaValidate([types, 'MyStruct', {'a': 5}], runtime.options), {'a': 5});
});


test('script library, schemaValidateTypeModel', (t) => {
    const runtime = testRuntime();
    const typeModel = markdownScriptFunctions.schemaTypeModel([], runtime.options);
    t.deepEqual(markdownScriptFunctions.schemaValidateTypeModel([typeModel], runtime.options), typeModel);
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
